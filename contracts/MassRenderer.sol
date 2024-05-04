// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "solady/src/utils/Base64.sol";

import {IScriptyBuilderV2, HTMLRequest, HTMLTagType, HTMLTag} from "./lib/scripty/interfaces/IScriptyBuilderV2.sol";

interface IMassContract {
  function tokenData(uint256 tokenId) external view returns (uint256, uint256, bytes32, uint256);

  function getSelectors() external view returns (string memory, string memory);

  function totalSupply() external view returns (uint256);

  function baseTimestamp() external view returns (uint256);
}

/// @title MassRenderer
/// @author @0x_jj
contract MassRenderer is AccessControl {
  IMassContract public massContract;

  address public immutable scriptyStorageAddress;
  address public immutable scriptyBuilderAddress;
  uint256 private bufferSize;

  string public baseImageURI;

  uint256 private royaltyPct = 5;

  struct Seed {
    uint256 current;
    uint256 incrementor;
  }

  struct Trait {
    string typeName;
    string valueName;
  }

  struct ScriptDefinition {
    string name;
    HTMLTagType tagType;
  }

  ScriptDefinition[] public scriptDefinitions;

  struct ScriptConstantVarNames {
    string objects;
    string palettes;
    string contractAddy;
    string contractMetricsSelector;
    string tokenMetricsSelector;
    string baseTimestamp;
    string royaltyPercent;
    string tokenId;
    string seedToken;
    string resetTimestamp;
  }

  ScriptConstantVarNames public scriptConstantVarNames;

  constructor(
    address[] memory admins_,
    address _scriptyBuilderAddress,
    address _scriptyStorageAddress,
    string memory baseImageURI_
  ) {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    for (uint256 i = 0; i < admins_.length; i++) {
      _grantRole(DEFAULT_ADMIN_ROLE, admins_[i]);
    }

    scriptyStorageAddress = _scriptyStorageAddress;
    scriptyBuilderAddress = _scriptyBuilderAddress;
    baseImageURI = baseImageURI_;

    scriptDefinitions.push(ScriptDefinition("three-v0.147.0.min.js.gz", HTMLTagType.scriptGZIPBase64DataURI));
    scriptDefinitions.push(ScriptDefinition("jb_mass_objects", HTMLTagType.scriptGZIPBase64DataURI));
    scriptDefinitions.push(ScriptDefinition("jb_mass_textures", HTMLTagType.scriptGZIPBase64DataURI));
    scriptDefinitions.push(ScriptDefinition("gunzipScripts-0.0.1", HTMLTagType.script));
    scriptDefinitions.push(ScriptDefinition("jb_mass_base", HTMLTagType.script));
    scriptDefinitions.push(ScriptDefinition("jb_mass_parameters", HTMLTagType.script));
    scriptDefinitions.push(ScriptDefinition("jb_mass_main", HTMLTagType.script));

    setScriptConstantVarNames(
      ScriptConstantVarNames({
        objects: "traitsObjects",
        palettes: "traitsPalette",
        contractAddy: "contractAddress",
        contractMetricsSelector: "contractMetricsSelector",
        tokenMetricsSelector: "jsonRpcCallDataContract",
        baseTimestamp: "contractMintTimestamp",
        royaltyPercent: "royaltyPercent",
        tokenId: "tokenId",
        seedToken: "tokenHash",
        resetTimestamp: "resetTimestamp"
      })
    );
  }

  function setMassContract(address _massContract) public onlyRole(DEFAULT_ADMIN_ROLE) {
    massContract = IMassContract(_massContract);
  }

  function setBaseImageURI(string calldata uri) public onlyRole(DEFAULT_ADMIN_ROLE) {
    baseImageURI = uri;
  }

  function setRoyaltyPct(uint256 pct) public onlyRole(DEFAULT_ADMIN_ROLE) {
    royaltyPct = pct;
  }

  function setScriptDefinition(
    uint256 idx,
    string calldata scriptName,
    HTMLTagType tagType
  ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(idx < scriptDefinitions.length, "Index out of bounds");
    scriptDefinitions[idx].name = scriptName;
    scriptDefinitions[idx].tagType = tagType;
  }

  function updateBufferSize(uint256 newSize) public onlyRole(DEFAULT_ADMIN_ROLE) {
    bufferSize = newSize;
  }

  function getSeedVariables(uint256 tokenId) internal view returns (uint256, uint256, uint256) {
    (, , bytes32 seed, uint256 resetTimestamp) = massContract.tokenData(tokenId);
    uint256 seedToken = uint256(seed) % (10 ** 6);
    uint256 tokenSeedIncrement = 999 + tokenId;
    return (seedToken, tokenSeedIncrement, resetTimestamp);
  }

  function getMetadataObject(
    bytes memory animationUrl,
    uint256 tokenId
  ) internal view returns (bytes memory) {
    string memory tid = toString(tokenId);

    return
      abi.encodePacked(
        '{"name":"Mass #',
        tid,
        '", "description":"GOLD is a dynamic cryptoart series where the artworks change in response to the collection',
        "'s own live market activity. The actions of GOLD collectors are part of this ever-changing artwork, where prices, levels of activity and on-chain provenance define the art itself.\\n\\n",
        "How does the market affect the way we see art? Does the sale price of an NFT change our perception of it? In GOLD, market factors literally influence the appearance of the dynamic imagery. From a sale to a listing, from the amount of time an artwork is held to whether it has recently been flipped, all this data is recorded by the contract and reflected live in each GOLD piece.\\n\\nGOLD is an artistic exploration of NFT market behaviour. It explores how we see in digital environments, and how market networks influence how we see. The full spectrum of possibilities for GOLD will take years to reveal.\\n\\nThe series is 100% on-chain - the artworks are composed and rendered directly from the blockchain - with live data streamed from an Ethereum node. Viewers can change the node by pressing",
        " 'G'.",
        '",',
        '"external_url": "https://mass.is/token/',
        tid,
        '", "image": "',
        baseImageURI,
        tid,
        '.jpg"',
        ', "animation_url":"',
        animationUrl,
        '", "attributes": [',
        getJSONAttributes(generateAllTraits(tokenId)),
        "]}"
      );
  }

  enum VariableType {
    STRING,
    NUMBER
  }

  function constructJsScalarVar(
    VariableType varType,
    string memory name,
    string memory value
  ) internal pure returns (string memory) {
    if (varType == VariableType.STRING) {
      return string(abi.encodePacked("let ", name, ' = "', value, '";'));
    } else if (varType == VariableType.NUMBER) {
      return string(abi.encodePacked("let ", name, " = ", value, ";"));
    } else {
      revert("Invalid varType");
    }
  }

  function constructJsArrayVar(
    string memory name,
    uint256[] memory values
  ) internal pure returns (string memory) {
    string memory jsArray = "[";
    for (uint256 i = 0; i < values.length; i++) {
      jsArray = string(abi.encodePacked(jsArray, toString(values[i]), i == values.length - 1 ? "" : ","));
    }
    jsArray = string(abi.encodePacked(jsArray, "]"));

    return string(abi.encodePacked("let ", name, " = ", jsArray, ";"));
  }

  struct ScriptConstants {
    string contractAddy;
    string contractMetricsSelector;
    string tokenMetricsSelector;
    string baseTimestamp;
    string royaltyPercent;
    string tokenId;
    uint256 seedToken;
    uint256 seedIncrement;
    uint256 resetTimestamp;
  }

  function setScriptConstantVarNames(
    ScriptConstantVarNames memory varNames
  ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    scriptConstantVarNames = varNames;
  }

  function getRawTraitsArrays(uint256 seedToken, uint256 seedIncrement) public view returns (bytes memory) {
    Seed memory seed = Seed({current: seedToken, incrementor: seedIncrement});

    uint256[] memory palettes = pickFromProbabilityArray(paletteProbabilties, seed);
    uint256[] memory objects = generateObjectTraits(objectProbabilities, seed);

    return
      abi.encodePacked(
        constructJsArrayVar(scriptConstantVarNames.palettes, palettes),
        constructJsArrayVar(scriptConstantVarNames.objects, objects)
      );
  }

  function getConstantsScript(ScriptConstants memory constants) internal view returns (bytes memory) {
    return
      abi.encodePacked(
        getRawTraitsArrays(constants.seedToken, constants.seedIncrement),
        constructJsScalarVar(
          VariableType.STRING,
          scriptConstantVarNames.contractAddy,
          constants.contractAddy
        ),
        constructJsScalarVar(
          VariableType.STRING,
          scriptConstantVarNames.contractMetricsSelector,
          constants.contractMetricsSelector
        ),
        constructJsScalarVar(
          VariableType.STRING,
          scriptConstantVarNames.tokenMetricsSelector,
          constants.tokenMetricsSelector
        ),
        constructJsScalarVar(
          VariableType.NUMBER,
          scriptConstantVarNames.baseTimestamp,
          constants.baseTimestamp
        ),
        constructJsScalarVar(
          VariableType.NUMBER,
          scriptConstantVarNames.royaltyPercent,
          constants.royaltyPercent
        ),
        constructJsScalarVar(VariableType.NUMBER, scriptConstantVarNames.tokenId, constants.tokenId),
        constructJsScalarVar(
          VariableType.NUMBER,
          scriptConstantVarNames.seedToken,
          toString(constants.seedToken)
        ),
        constructJsScalarVar(
          VariableType.NUMBER,
          scriptConstantVarNames.resetTimestamp,
          toString(constants.resetTimestamp)
        )
      );
  }

  function tokenURI(uint256 tokenId) external view returns (string memory) {
    /// WrappedScriptRequest[] memory requests = new WrappedScriptRequest[](15);

    HTMLTag[] memory requests = new HTMLTag[](15);

    (uint256 tokenSeed, uint256 tokenSeedIncrement, uint256 resetTimestamp) = getSeedVariables(tokenId);
    (string memory contractMetricsSelector, string memory tokenMetricsSelector) = massContract.getSelectors();
    uint256 baseTimestamp = massContract.baseTimestamp();

    ScriptConstants memory constants = ScriptConstants({
      contractAddy: Strings.toHexString(address(massContract)),
      contractMetricsSelector: contractMetricsSelector,
      tokenMetricsSelector: tokenMetricsSelector,
      baseTimestamp: toString(baseTimestamp),
      royaltyPercent: toString(royaltyPct),
      tokenId: toString(tokenId),
      seedToken: tokenSeed,
      seedIncrement: tokenSeedIncrement,
      resetTimestamp: resetTimestamp
    });

    requests[0].tagType = HTMLTagType.script;
    requests[0].tagContent = getConstantsScript(constants);

    for (uint256 i = 0; i < scriptDefinitions.length; i++) {
      requests[i + 1].name = scriptDefinitions[i].name;
      requests[i + 1].tagType = scriptDefinitions[i].tagType;
      requests[i + 1].contractAddress = scriptyStorageAddress;
    }

    HTMLRequest memory htmlRequest;
    htmlRequest.bodyTags = requests;

    bytes memory base64EncodedHTMLDataURI = IScriptyBuilderV2(scriptyBuilderAddress).getEncodedHTML(
      htmlRequest
    );

    return
      string(
        abi.encodePacked(
          "data:application/json;base64,",
          Base64.encode(getMetadataObject(base64EncodedHTMLDataURI, tokenId))
        )
      );
  }

  function getJSONAttributes(Trait[] memory allTraits) internal pure returns (string memory) {
    string memory attributes;
    uint256 i;
    uint256 length = allTraits.length;
    unchecked {
      do {
        attributes = string(abi.encodePacked(attributes, getJSONTraitItem(allTraits[i], i == length - 1)));
      } while (++i < length);
    }
    return attributes;
  }

  function getJSONTraitItem(Trait memory trait, bool lastItem) internal pure returns (string memory) {
    return
      string(
        abi.encodePacked(
          '{"trait_type": "',
          trait.typeName,
          '", "value": "',
          trait.valueName,
          '"}',
          lastItem ? "" : ","
        )
      );
  }

  function nextInt(Seed memory seed) internal pure returns (uint256) {
    seed.current = (1664525 * seed.current + seed.incrementor) % 89652912;
    return seed.current % 101;
  }

  function pickFromProbabilityArray(
    uint256[] memory arr,
    Seed memory randomSeed
  ) internal pure returns (uint256[] memory) {
    if (arr.length == 3) {
      return arr;
    }

    uint256 pick = nextInt(randomSeed) % (arr.length - 3);
    uint256 pickIndex = (pick / 3) * 3;
    for (uint256 i = 0; i < 100; i++) {
      uint256 r = nextInt(randomSeed);
      uint256 candidate = r % (arr.length - 3);
      uint256 candidateIndex = (candidate / 3) * 3;
      uint256 candidateProbability = arr[candidateIndex];
      if (candidateProbability > nextInt(randomSeed)) {
        pickIndex = candidateIndex;
        break;
      }
    }

    uint256[] memory result = new uint256[](3);
    result[0] = arr[pickIndex];
    result[1] = arr[pickIndex + 1];
    result[2] = arr[pickIndex + 2];
    return result;
  }

  function generateObjectTraits(
    uint8[] memory probabilities,
    Seed memory randomSeed
  ) internal pure returns (uint256[] memory) {
    uint256 currentObjectProbability = 256; // Using 256 as an impossible value for a uint8 to indicate 'unset'
    uint256 currentObjectIndex = 256; // Same as above
    uint256[] memory currentObjectMaterialProbabilities = new uint256[](probabilities.length);

    uint256 currentObjectMaterialCount = 0;
    uint256[] memory objects = new uint[](probabilities.length); // Allocate maximum possible size to avoid push error
    uint256 objectCount = 0;

    for (uint256 i = 0; i < probabilities.length; i++) {
      uint256 v = probabilities[i];
      if (v == 255) {
        if (currentObjectProbability > nextInt(randomSeed)) {
          uint256[] memory material = pickFromProbabilityArray(
            trimArray(currentObjectMaterialProbabilities, currentObjectMaterialCount),
            randomSeed
          );
          uint256 materialIndex = material[1];
          uint256 materialTraitName = material[2];
          objects[objectCount++] = currentObjectIndex;
          objects[objectCount++] = materialIndex;
          objects[objectCount++] = materialTraitName;
        }
        currentObjectProbability = 256;
        currentObjectIndex = 256;
        currentObjectMaterialCount = 0;
        currentObjectMaterialProbabilities = new uint256[](probabilities.length);
      } else if (currentObjectProbability == 256) {
        currentObjectProbability = v;
      } else if (currentObjectIndex == 256) {
        currentObjectIndex = v;
      } else {
        currentObjectMaterialProbabilities[currentObjectMaterialCount++] = v;
      }
    }

    return trimArray(objects, objectCount);
  }

  function trimArray(uint256[] memory arr, uint256 toLength) internal pure returns (uint256[] memory) {
    uint256[] memory trimmed = new uint256[](toLength);
    for (uint256 i = 0; i < toLength; i++) {
      trimmed[i] = arr[i];
    }
    return trimmed;
  }

  function generateAllTraits(uint256 tokenId) public view returns (Trait[] memory) {
    (uint256 tokenSeed, uint256 tokenSeedIncrement, ) = getSeedVariables(tokenId);
    Seed memory seed = Seed({current: tokenSeed, incrementor: tokenSeedIncrement});

    uint256[] memory palettes = pickFromProbabilityArray(paletteProbabilties, seed);
    uint256[] memory objects = generateObjectTraits(objectProbabilities, seed);

    Trait[] memory allTraits = new Trait[]((palettes.length / 3) + (objects.length / 3));

    allTraits[0] = Trait({typeName: paletteTraitName, valueName: text_traits[palettes[2]]});

    uint256 j = 1;
    for (uint256 i = 0; i < objects.length; i += 3) {
      uint256 textTraitIdx = i + 2;
      uint256 traitArrayIdx = j;
      allTraits[traitArrayIdx] = Trait({typeName: text_traits[textTraitIdx], valueName: "true"});
      j++;
    }

    return allTraits;
  }

  function stringEq(string memory a, string memory b) internal pure returns (bool result) {
    assembly {
      result := eq(keccak256(add(a, 0x20), mload(a)), keccak256(add(b, 0x20), mload(b)))
    }
  }

  function findElement(string[] memory arr, string memory element) internal pure returns (bool) {
    for (uint256 i = 0; i < arr.length; i++) {
      if (stringEq(arr[i], element)) {
        return true;
      }
    }
    return false;
  }

  function findElement(uint[] memory arr, uint element) internal pure returns (bool) {
    for (uint256 i = 0; i < arr.length; i++) {
      if (arr[i] == element) {
        return true;
      }
    }
    return false;
  }

  function toString(uint256 value) internal pure returns (string memory) {
    // Inspired by OraclizeAPI's implementation - MIT licence
    // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

    if (value == 0) {
      return "0";
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
      digits++;
      temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
      digits -= 1;
      buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
      value /= 10;
    }
    return string(buffer);
  }

  string internal paletteTraitName = "\u002d\u0041\u0039\u0038\u003a\u241f";

  uint8[] internal objectProbabilities = [
    60,
    0,
    100,
    21,
    93,
    255,
    80,
    1,
    10,
    14,
    0,
    10,
    18,
    1,
    10,
    20,
    2,
    50,
    21,
    3,
    10,
    1,
    4,
    10,
    9,
    5,
    255,
    100,
    2,
    100,
    21,
    122,
    255,
    50,
    3,
    10,
    14,
    68,
    10,
    18,
    69,
    10,
    20,
    70,
    10,
    3,
    71,
    10,
    4,
    72,
    10,
    5,
    73,
    10,
    6,
    74,
    10,
    7,
    75,
    10,
    8,
    76,
    10,
    9,
    77,
    255,
    30,
    4,
    10,
    0,
    104,
    10,
    14,
    105,
    10,
    18,
    106,
    10,
    20,
    107,
    10,
    21,
    108,
    10,
    2,
    109,
    10,
    9,
    110,
    10,
    3,
    111,
    10,
    4,
    112,
    10,
    5,
    113,
    10,
    6,
    114,
    255,
    30,
    5,
    10,
    13,
    79,
    10,
    19,
    80,
    10,
    10,
    81,
    10,
    11,
    82,
    16,
    12,
    83,
    16,
    15,
    84,
    10,
    16,
    85,
    10,
    17,
    86,
    255,
    50,
    6,
    100,
    0,
    67,
    255,
    20,
    7,
    10,
    14,
    87,
    10,
    0,
    88,
    10,
    9,
    89,
    10,
    3,
    90,
    10,
    4,
    91,
    10,
    5,
    92,
    255,
    100,
    8,
    10,
    0,
    55,
    10,
    14,
    56,
    10,
    21,
    57,
    10,
    4,
    58,
    255,
    50,
    9,
    10,
    0,
    50,
    10,
    9,
    51,
    10,
    3,
    52,
    10,
    4,
    53,
    10,
    5,
    54,
    255,
    20,
    10,
    10,
    0,
    59,
    10,
    14,
    60,
    10,
    18,
    61,
    10,
    20,
    62,
    10,
    21,
    63,
    10,
    1,
    64,
    10,
    9,
    65,
    10,
    3,
    66,
    255,
    100,
    11,
    100,
    0,
    78,
    255,
    30,
    12,
    10,
    0,
    94,
    10,
    14,
    95,
    10,
    18,
    96,
    10,
    20,
    97,
    10,
    21,
    98,
    10,
    1,
    99,
    10,
    9,
    100,
    10,
    3,
    101,
    10,
    4,
    102,
    10,
    5,
    103,
    255,
    50,
    13,
    10,
    0,
    115,
    10,
    14,
    116,
    10,
    18,
    117,
    10,
    21,
    118,
    10,
    3,
    119,
    10,
    4,
    120,
    10,
    5,
    121,
    255,
    0,
    14,
    10,
    14,
    6,
    10,
    18,
    7,
    30,
    20,
    8,
    30,
    21,
    9,
    30,
    1,
    10,
    30,
    9,
    11,
    20,
    3,
    12,
    20,
    4,
    13,
    20,
    5,
    14,
    255,
    0,
    15,
    10,
    14,
    15,
    10,
    18,
    16,
    20,
    20,
    17,
    20,
    9,
    18,
    20,
    21,
    19,
    20,
    3,
    20,
    20,
    4,
    21,
    20,
    5,
    22,
    20,
    6,
    23,
    255,
    0,
    16,
    10,
    14,
    24,
    10,
    18,
    25,
    20,
    20,
    26,
    20,
    9,
    27,
    20,
    21,
    28,
    20,
    3,
    29,
    20,
    4,
    30,
    20,
    5,
    31,
    20,
    6,
    32,
    255,
    100,
    17,
    10,
    14,
    33,
    30,
    18,
    34,
    30,
    21,
    35,
    30,
    20,
    36,
    30,
    9,
    37,
    30,
    1,
    38,
    20,
    3,
    39,
    20,
    4,
    40,
    20,
    5,
    41,
    255,
    0,
    18,
    10,
    14,
    42,
    10,
    18,
    43,
    10,
    21,
    44,
    10,
    20,
    45,
    10,
    9,
    46,
    10,
    1,
    47,
    10,
    4,
    48,
    10,
    5,
    49,
    255
  ];
  uint256[] internal paletteProbabilties = [
    0,
    4,
    123,
    1,
    3,
    124,
    2,
    3,
    125,
    3,
    4,
    126,
    4,
    4,
    127,
    5,
    4,
    128,
    6,
    4,
    129,
    7,
    3,
    130,
    8,
    4,
    131,
    9,
    3,
    132,
    10,
    3,
    133,
    11,
    4,
    134,
    12,
    3,
    135,
    13,
    4,
    136,
    14,
    4,
    137,
    15,
    4,
    138,
    16,
    4,
    139,
    17,
    4,
    140,
    18,
    3,
    141,
    19,
    2,
    142,
    20,
    4,
    143,
    21,
    4,
    144,
    22,
    3,
    145,
    23,
    2,
    146,
    24,
    2,
    147,
    25,
    4,
    148,
    26,
    4,
    149,
    27,
    2,
    150,
    28,
    4,
    151,
    29,
    4,
    152,
    30,
    3,
    153,
    31,
    2,
    154,
    32,
    4,
    155,
    33,
    4,
    156,
    34,
    2,
    157
  ];

  string[] internal text_traits = [
    "\u2417\u0040\u0030\u2410\u004b\u0060\u0024",
    "\u002e\u2412\u2403\u0072\u006b\u0043",
    "\u240b\u005b\u006c\u0071\u004d\u0069\u007c",
    "\u2414\u0054\u240a\u240f\u2411\u0027\u241c",
    "\u240c\u0054\u2418\u2418\u0040\u007a\u240b",
    "\u241c\u0069\u0068\u007d\u0054\u2409\u0051",
    "\u0029\u2405\u0043\u0033\u0052\u0040\u0064\u2404\u0047\u0060\u007c\u002b\u240b\u003b\u0032",
    "\u0064\u002d\u2401\u0032\u2411\u0075\u006b\u0024\u0057\u0020\u0024\u002a\u0059\u240f\u0078",
    "\u0021\u003f\u241f\u0035\u0051\u007a\u0069\u006f\u0025\u0078\u2411\u241e\u0046\u004b\u0029",
    "\u0063\u0058\u2400\u002a\u002b\u0035\u0026\u0042\u0076\u0072\u0078\u002f\u0064\u0078\u0053",
    "\u0065\u2409\u0024\u241a\u0039\u0052\u241d\u2410\u003f\u0061\u0027\u002b\u0074\u007e\u0062",
    "\u2408\u0037\u0023\u0036\u0023\u0023\u007b\u241d\u005b\u240f\u0032\u0024\u002c\u004b\u241b",
    "\u0044\u2404\u0031\u0071\u0064\u0035\u240d\u0041\u007d\u004d\u2417\u0034\u004d\u002e\u0027",
    "\u0066\u2402\u2421\u003a\u2411\u0066\u007b\u0049\u241c\u004e\u0047\u0050\u006d\u2412\u005a",
    "\u2406\u0049\u004d\u2415\u2418\u241b\u0021\u002c\u240f\u003b\u0075\u0076\u0048\u0078\u005b",
    "\u0032\u0024\u240f\u004a\u003a\u0030\u0076\u0033\u0061\u0069\u0059\u0035\u0028\u0033\u2418",
    "\u2421\u240b\u0048\u0043\u005f\u0043\u0043\u2414\u0028\u0029\u0060\u241c\u0075\u240d\u241f",
    "\u007a\u2403\u0063\u0071\u0048\u2413\u0023\u2404\u007d\u0058\u0072\u0029\u0035\u0028\u0033",
    "\u007a\u0027\u0024\u2410\u0052\u0077\u004d\u007e\u0021\u2404\u0075\u0062\u240e\u0047\u0074",
    "\u0041\u0059\u2419\u0047\u005d\u0060\u0079\u241a\u0076\u0075\u0065\u0074\u2416\u0067\u0071",
    "\u0036\u2408\u0023\u005e\u241c\u0039\u006d\u240e\u0024\u002f\u0079\u0060\u0042\u007c\u2410",
    "\u0048\u006e\u240f\u241c\u0035\u007b\u2412\u002e\u0055\u007b\u0040\u0057\u240b\u2407\u002f",
    "\u002c\u005e\u006b\u0036\u0025\u0029\u002d\u0034\u0056\u2400\u240f\u003c\u0056\u0078\u0059",
    "\u0063\u0075\u240f\u002f\u007e\u2407\u2408\u003d\u0032\u0052\u0064\u0039\u240d\u0065\u2409",
    "\u0047\u2405\u003f\u005e\u2412\u007c\u0065\u0054\u0030\u0068\u0053\u0060\u0023\u0028\u005e",
    "\u2405\u0023\u240c\u003d\u0024\u002a\u0027\u006b\u241d\u005a\u0037\u0024\u0070\u002e",
    "\u002f\u2400\u002a\u241c\u003d\u0028\u0024\u004e\u004d\u2416\u2410\u005f\u0061\u0029\u0036",
    "\u240d\u0033\u0024\u0056\u0076\u0047\u003b\u007a\u0061\u2410\u003a\u0035\u002e\u2415\u002a",
    "\u007a\u2407\u004e\u0054\u2411\u240f\u2417\u0075\u007e\u0067\u003f\u0063\u0054\u2416\u0023",
    "\u2419\u0061\u0039\u0060\u0055\u0042\u0028\u003c\u0056\u241d\u006c\u006f\u0064\u0069\u0040",
    "\u0069\u0024\u0067\u0024\u241b\u0059\u2409\u0033\u002a\u0057\u0038\u006b\u0037\u007d\u0038",
    "\u007a\u0024\u240d\u002f\u2405\u0038\u0037\u004c\u003c\u0033\u241e\u0028\u2414\u007d\u0028",
    "\u0032\u0051\u004c\u0043\u0020\u003b\u0054\u0021\u0032\u0028\u241f\u003d\u002d\u005a\u241b",
    "\u2406\u241a\u0063\u0041\u0044\u0058\u007e\u0040\u0047\u0070\u004b\u0066\u0076\u0047\u005f",
    "\u0074\u0078\u0027\u0033\u2404\u002e\u0078\u0077\u0068\u0044\u003f\u0055\u0074\u004a",
    "\u0031\u0045\u0067\u241c\u2415\u241e\u240d\u007b\u2405\u2400\u0038\u007c\u241c\u002f\u0063",
    "\u0073\u2402\u0048\u0037\u2403\u0049\u0037\u0059\u004c\u0071\u0075\u0028\u241d\u240c\u0052",
    "\u0048\u241e\u003b\u0064\u005e\u0039\u005e\u002b\u004f\u0073\u0048\u0059\u0029\u0056\u0043",
    "\u240f\u004c\u2409\u0038\u0033\u002f\u240a\u002f\u0049\u241e\u0024\u240c\u2414\u0076\u004d",
    "\u2401\u2418\u0035\u003f\u003a\u2419\u0071\u0042\u241e\u002e\u0047\u0059\u003e\u0032\u0041",
    "\u0079\u0072\u2419\u0076\u240d\u0067\u0039\u003d\u0079\u0055\u0064\u0042\u002b\u0023\u007c",
    "\u0071\u0047\u0039\u003e\u0049\u0074\u2418\u0070\u0020\u0063\u0048\u0027\u0029\u0059\u0024",
    "\u2402\u0054\u007d\u0038\u005f\u2414\u007e\u004b\u002d\u241a\u0044\u003a\u2421\u0037\u006c",
    "\u0058\u2411\u0034\u0057\u0063\u240e\u003f\u0036\u241e\u241b\u2407\u0027\u005f\u2402\u2406",
    "\u0046\u0039\u0038\u0068\u0033\u2416\u0070\u005b\u005e\u0028\u002c\u005b\u0025\u240d\u2413",
    "\u0067\u0065\u007c\u0075\u0026\u004d\u0070\u240e\u0048\u0036\u0027\u0071\u002a\u0026\u2419",
    "\u0031\u2400\u240c\u2403\u006a\u005a\u0061\u0071\u2409\u0035\u005d\u0050\u0060\u240f\u006b",
    "\u0069\u2407\u0067\u004a\u0077\u0051\u0050\u2407\u0074\u0040\u0064\u002d\u003a\u0066\u2407",
    "\u0047\u0073\u2418\u2412\u0046\u003f\u2417\u005b\u006a\u0052\u2417\u0062\u0033\u0043\u2404",
    "\u240b\u002c\u0051\u006a\u003d\u007a\u007d\u007c\u2404\u0037\u003a\u0024\u0064\u240b\u006c",
    "\u0070\u0040\u003c\u2414\u0067\u2415\u002e",
    "\u0037\u2405\u2407\u004e\u0066\u2418\u2408",
    "\u0055\u2419\u2406\u0028\u0043\u0049\u0059",
    "\u0028\u0079\u240c\u0033\u0024\u2418\u0054",
    "\u0068\u0024\u005e\u240e\u2413\u0064\u0072",
    "\u0079\u005f\u0020\u005f\u007a\u005a\u0047",
    "\u002f\u2421\u004b\u004b\u240a\u0074\u0069",
    "\u2415\u0055\u005a\u0037\u007e\u0035\u0061",
    "\u003e\u006c\u2415\u2402\u2419\u0049\u2402",
    "\u0074\u006d\u240b\u003a\u003d",
    "\u0070\u0056\u241e\u2409\u0064",
    "\u0060\u006e\u003b\u004e\u240c",
    "\u241f\u0069\u0027\u0075\u2401\u0055\u2417",
    "\u0049\u0062\u240d\u0043\u241a\u0056\u241d",
    "\u241d\u0024\u0070\u0061\u0039\u0045\u2407",
    "\u0021\u2402\u004f\u0053\u006a\u0072\u0033",
    "\u2409\u0079\u0025\u0039\u002a\u003d\u0063",
    "\u2417\u240b\u240b\u2411\u241a\u240d\u2412\u2414\u2401\u2409\u2415\u2419\u2403\u2401\u241f\u240b",
    "\u2403\u2400\u240a\u240d\u2411",
    "\u2418\u2415\u2421\u240c\u240b",
    "\u2403\u240f\u241c\u2407\u2404",
    "\u2409\u2411\u2406\u241c\u2415",
    "\u2400\u241c\u2419\u241b\u2421",
    "\u240c\u2400\u240f\u240e\u2408",
    "\u240c\u2408\u241f\u240e\u240d",
    "\u2410\u2403\u2408\u2416\u241b",
    "\u240b\u2417\u2401\u2419\u2416",
    "\u2411\u2412\u2400\u2409\u2410",
    "\u2416",
    "\u2417\u2409\u240b\u241f\u240a\u240b\u2404",
    "\u2421\u2402\u2400\u241d\u2416\u2418\u240a",
    "\u240b\u2411\u2405\u241a\u2411\u2403\u2401",
    "\u2401\u240e\u240d\u2407\u2404\u241e\u2410",
    "\u240d\u2412\u2414\u2401\u2409\u2415\u2419",
    "\u240c\u2419\u2408\u2414\u240c\u240b\u2419",
    "\u240b\u2401\u2413\u2401\u2411\u2410\u2409",
    "\u240a\u241b\u241e\u240e\u2411\u240e\u240d",
    "\u005a\u007b\u006b\u0058\u2416",
    "\u003f\u2409\u0066\u0035\u0021",
    "\u0032\u0062\u2405\u0072\u0062",
    "\u004d\u2403\u0048\u241a\u241c",
    "\u2410\u0024\u005a\u0024\u0051",
    "\u2404\u0059\u2419\u005b\u0043",
    "\u2412\u240a\u2414",
    "\u0031\u0060\u0035\u003d",
    "\u0059\u0052\u0068\u0043\u240b",
    "\u0034\u240b\u006e\u0049\u0072",
    "\u0032\u2401\u002d\u0030\u2418",
    "\u002f\u0028\u0076\u2407\u002a",
    "\u0060\u007e\u003e\u005e\u0053",
    "\u2413\u003b\u0049\u0042\u0056",
    "\u0031\u0057\u0036\u0069\u0077",
    "\u2419\u007e\u0041\u003a\u004b",
    "\u2400\u003f\u0056\u004c\u003d",
    "\u006f\u0024\u2405\u0026\u003d",
    "\u0057\u241e\u0045\u0032\u0077",
    "\u0068\u004c\u0065\u003e\u0042",
    "\u240e\u004a\u0072\u0033\u240f",
    "\u2414\u0047\u006c\u2400\u0066",
    "\u2406\u004f\u0036\u004c\u2413",
    "\u2403\u0031\u0024\u0027\u002f",
    "\u007c\u0070\u241b\u2407\u2414",
    "\u0050\u003c\u003d\u002f\u0054",
    "\u0070\u2412\u0068\u0044\u0076",
    "\u005a\u003b\u0054\u2411\u0024",
    "\u0078\u0062\u002c\u240e\u0047",
    "\u2409\u0066\u0028\u003b\u0043",
    "\u006f\u002f",
    "\u0072\u0031\u007d\u0077\u0038",
    "\u2412\u241e\u0058\u240f\u2421",
    "\u0033\u2413\u007c\u002e\u0025",
    "\u0047\u002f\u002c\u0061\u0026",
    "\u2421\u240b\u2402\u2400\u241d\u2416\u2418\u240a\u240c\u2419\u2414\u240c",
    "\u002f\u0029\u240c\u0024\u2419\u240d",
    "\u2407\u2419\u2417\u0020\u240b\u2408",
    "\u2419\u0029\u0024\u0026\u241d\u002b",
    "\u002d\u0031\u241a\u2419\u2414\u2401",
    "\u2418\u2416\u0030\u2404\u002c",
    "\u2417\u0027\u2402\u241d\u240f\u0030",
    "\u0031\u2413\u2417\u2400\u0029\u0021",
    "\u240e\u241f\u0027\u240a\u002b\u2409",
    "\u240b\u240e\u2400\u2419\u2404\u0029",
    "\u2419\u0024\u2401\u240f\u240a\u0024",
    "\u0021\u002c\u0030\u0030\u240f\u0028",
    "\u2405\u0025\u2417\u240f\u0026\u002d",
    "\u0031\u0026\u240a\u2416\u240a\u2402",
    "\u0021\u2416\u2411\u2408\u0032\u240c",
    "\u241e\u0021\u0028\u002a\u2415\u240f",
    "\u0029\u241c\u002c\u2413\u2416\u240d",
    "\u241d\u2410\u2405\u2417\u241b\u0030",
    "\u2406\u2400\u240a\u2403\u0026\u2410",
    "\u002f\u240b\u2400\u241c\u2400\u240b",
    "\u2419\u241f\u240e\u0021\u0031",
    "\u2408\u240e\u2417\u0023\u2412",
    "\u0024\u240f\u240b\u0032\u241d\u0028",
    "\u2417\u240f\u0025\u2418\u002b\u0023",
    "\u2411\u002b\u2404\u241b\u2408\u002a",
    "\u0029\u2407\u241d\u0027\u2404\u0021",
    "\u2409\u0029\u2404\u2403\u240f\u0024",
    "\u240d\u0027\u2416\u240b\u241c\u0024",
    "\u002e\u2409\u240e\u240f\u240f\u2412",
    "\u2410\u240d\u0020\u240f\u0031\u2413",
    "\u2415\u002b\u240f\u2411\u2407\u0023",
    "\u240a\u002b\u240b\u240f\u240a\u241d\u0026",
    "\u2410\u0030\u241a\u0025\u2419\u0027",
    "\u2408\u002b\u002a\u002d\u2408\u002b\u0029",
    "\u002e\u2406\u0027\u2411\u0024\u0025",
    "\u2415\u2414\u241b\u002f\u2403\u2408"
  ];
}
