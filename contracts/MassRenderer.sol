// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "solady/src/utils/Base64.sol";

import {IScriptyBuilder, WrappedScriptRequest} from "./lib/scripty/IScriptyBuilder.sol";

import "hardhat/console.sol";

interface IMassContract {
  struct TokenData {
    uint256 transferCount;
    uint256[200] latestTransferTimestamps;
    uint256 mintTimestamp;
    bytes32 seed;
  }

  // Mapping from token ID to token data
  function tokenData(
    uint256 tokenId
  ) external view returns (uint256, uint256, bytes32, address, address, address, address, address, address);

  function getSelectors() external view returns (string memory, string memory);

  function numberOfBonusPlates(uint256 tokenId) external view returns (uint256);

  function numberOfBonusClusters() external view returns (uint256);

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
    uint8 wrapType;
  }

  ScriptDefinition[] public scriptDefinitions;

  constructor(
    address[] memory admins_,
    address _scriptyBuilderAddress,
    address _scriptyStorageAddress,
    uint256 bufferSize_,
    string memory baseImageURI_
  ) {
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    for (uint256 i = 0; i < admins_.length; i++) {
      _grantRole(DEFAULT_ADMIN_ROLE, admins_[i]);
    }

    scriptyStorageAddress = _scriptyStorageAddress;
    scriptyBuilderAddress = _scriptyBuilderAddress;
    bufferSize = bufferSize_;
    baseImageURI = baseImageURI_;

    scriptDefinitions.push(ScriptDefinition("jb_mass_base", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_goldWallets", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_dataTools", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_three", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_parameters", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_mersenneTwister", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_util", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_perlin", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_ImprovedNoise", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_OBJLoader", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_objects", 2));
    scriptDefinitions.push(ScriptDefinition("jb_mass_textures", 2));
    scriptDefinitions.push(ScriptDefinition("gunzipScripts-0.0.1", 0));
    scriptDefinitions.push(ScriptDefinition("jb_mass_main", 0));
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
    uint256 wrapType
  ) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(idx < scriptDefinitions.length, "Index out of bounds");
    scriptDefinitions[idx].name = scriptName;
    scriptDefinitions[idx].wrapType = uint8(wrapType);
  }

  function updateBufferSize(uint256 newSize) public onlyRole(DEFAULT_ADMIN_ROLE) {
    bufferSize = newSize;
  }

  function getSeedVariables(uint256 tokenId) internal view returns (uint256, uint256) {
    (, , bytes32 seed, , , , , , ) = massContract.tokenData(tokenId);
    uint256 seedToken = uint256(seed) % (10 ** 6);
    uint256 tokenSeedIncrement = 999 + tokenId;
    return (seedToken, tokenSeedIncrement);
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
        //getJSONAttributes(generateAllTraits(tokenId)),
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

  function getConstantsScript(
    string memory contractAddy,
    string memory contractMetricsSelector,
    string memory tokenMetricsSelector,
    string memory baseTimestamp,
    string memory royaltyPercent,
    string memory tokenId,
    string memory seedToken,
    string memory seedIncrement
  ) internal view returns (bytes memory) {
    (string memory palettes, ) = generateAllTraits(1);
    return
      abi.encodePacked(
        palettes,
        constructJsScalarVar(VariableType.STRING, "J", contractAddy),
        constructJsScalarVar(VariableType.STRING, "K", contractMetricsSelector),
        constructJsScalarVar(VariableType.STRING, "X", tokenMetricsSelector),
        constructJsScalarVar(VariableType.NUMBER, "$", baseTimestamp),
        constructJsScalarVar(VariableType.NUMBER, "U", royaltyPercent),
        constructJsScalarVar(VariableType.NUMBER, "H", tokenId),
        constructJsScalarVar(VariableType.NUMBER, "y", seedToken),
        constructJsScalarVar(VariableType.NUMBER, "h", seedIncrement)
      );
  }

  function tokenURI(uint256 tokenId) external view returns (string memory) {
    WrappedScriptRequest[] memory requests = new WrappedScriptRequest[](15);

    requests[0].wrapType = 0; // <script>[script]</script>
    requests[0].scriptContent = getConstantsScript(
      Strings.toHexString(address(massContract)),
      "gm",
      "gm2",
      toString(block.timestamp),
      toString(5),
      toString(tokenId),
      toString(123),
      toString(456)
    );

    for (uint256 i = 0; i < scriptDefinitions.length; i++) {
      requests[i + 1].name = scriptDefinitions[i].name;
      requests[i + 1].wrapType = scriptDefinitions[i].wrapType;
      requests[i + 1].contractAddress = scriptyStorageAddress;
    }

    bytes memory base64EncodedHTMLDataURI = IScriptyBuilder(scriptyBuilderAddress).getEncodedHTMLWrapped(
      requests,
      bufferSize + requests[0].scriptContent.length + 17
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

  function generateAllTraits(uint256 tokenId) public view returns (string memory, string memory) {
    // (uint256 tokenSeed, uint256 tokenSeedIncrement) = getSeedVariables(tokenId);
    // Seed memory seed = Seed({current: tokenSeed, incrementor: tokenSeedIncrement});

    Seed memory seed = Seed({current: 14566587, incrementor: 586931});

    uint256[] memory palettes = pickFromProbabilityArray(paletteProbabilties, seed);
    uint256[] memory objects = generateObjectTraits(objectProbabilities, seed);

    return (constructJsArrayVar("palettes", palettes), constructJsArrayVar("objects", objects));
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

  uint8[] internal objectProbabilities = [
    100,
    0,
    100,
    21,
    47,
    255,
    100,
    1,
    100,
    21,
    125,
    255,
    100,
    2,
    100,
    21,
    116,
    255,
    50,
    3,
    10,
    14,
    80,
    10,
    18,
    97,
    10,
    20,
    83,
    10,
    3,
    99,
    10,
    4,
    49,
    10,
    5,
    177,
    10,
    6,
    4,
    10,
    7,
    185,
    10,
    8,
    196,
    10,
    9,
    73,
    255,
    30,
    4,
    10,
    0,
    126,
    10,
    14,
    68,
    10,
    18,
    187,
    10,
    20,
    154,
    10,
    21,
    131,
    10,
    2,
    204,
    10,
    9,
    130,
    10,
    3,
    181,
    10,
    4,
    46,
    10,
    5,
    74,
    10,
    6,
    70,
    255,
    30,
    5,
    10,
    13,
    23,
    10,
    19,
    71,
    10,
    10,
    32,
    10,
    11,
    12,
    16,
    12,
    137,
    16,
    15,
    36,
    10,
    16,
    43,
    10,
    17,
    145,
    255,
    50,
    6,
    100,
    0,
    34,
    255,
    20,
    7,
    10,
    14,
    168,
    10,
    0,
    211,
    10,
    9,
    173,
    10,
    3,
    132,
    10,
    4,
    26,
    10,
    5,
    159,
    255,
    100,
    8,
    10,
    0,
    150,
    10,
    14,
    193,
    10,
    21,
    77,
    10,
    4,
    9,
    255,
    50,
    9,
    10,
    0,
    141,
    10,
    9,
    100,
    10,
    3,
    13,
    10,
    4,
    59,
    10,
    5,
    201,
    255,
    20,
    10,
    10,
    0,
    156,
    10,
    14,
    118,
    10,
    18,
    136,
    10,
    20,
    0,
    10,
    21,
    115,
    10,
    1,
    7,
    10,
    9,
    53,
    10,
    3,
    188,
    255,
    100,
    11,
    10,
    14,
    166,
    10,
    0,
    35,
    10,
    9,
    20,
    10,
    4,
    144,
    255,
    30,
    12,
    10,
    0,
    107,
    10,
    14,
    207,
    10,
    18,
    105,
    10,
    20,
    214,
    10,
    21,
    217,
    10,
    1,
    155,
    10,
    9,
    89,
    10,
    3,
    198,
    10,
    4,
    87,
    10,
    5,
    42,
    255,
    50,
    13,
    10,
    0,
    24,
    10,
    14,
    205,
    10,
    18,
    167,
    10,
    21,
    210,
    10,
    3,
    206,
    10,
    4,
    161,
    10,
    5,
    190,
    255,
    0,
    14,
    10,
    14,
    98,
    10,
    18,
    216,
    30,
    20,
    64,
    30,
    21,
    1,
    30,
    1,
    123,
    30,
    9,
    127,
    20,
    3,
    183,
    20,
    4,
    129,
    20,
    5,
    62,
    255,
    0,
    15,
    10,
    14,
    140,
    10,
    18,
    94,
    20,
    20,
    142,
    20,
    9,
    90,
    20,
    21,
    209,
    20,
    3,
    186,
    20,
    4,
    213,
    20,
    5,
    41,
    20,
    6,
    191,
    255,
    0,
    16,
    10,
    14,
    195,
    10,
    18,
    103,
    20,
    20,
    124,
    20,
    9,
    85,
    20,
    21,
    117,
    20,
    3,
    79,
    20,
    4,
    91,
    20,
    5,
    184,
    20,
    6,
    179,
    255,
    100,
    17,
    10,
    14,
    29,
    30,
    18,
    149,
    30,
    21,
    157,
    30,
    20,
    25,
    30,
    9,
    81,
    30,
    1,
    194,
    20,
    3,
    63,
    20,
    4,
    152,
    20,
    5,
    120,
    255,
    0,
    18,
    10,
    14,
    169,
    10,
    18,
    119,
    10,
    21,
    58,
    10,
    20,
    215,
    10,
    9,
    197,
    10,
    1,
    153,
    10,
    4,
    16,
    10,
    5,
    114,
    255
  ];
  uint256[] internal paletteProbabilties = [
    0,
    10,
    27,
    1,
    5,
    180,
    2,
    5,
    172,
    3,
    10,
    208,
    4,
    10,
    164,
    5,
    10,
    40,
    6,
    10,
    38,
    7,
    5,
    139,
    8,
    10,
    175,
    9,
    5,
    31,
    10,
    5,
    147,
    11,
    10,
    171,
    12,
    5,
    17,
    13,
    10,
    69,
    14,
    10,
    50,
    15,
    10,
    11,
    16,
    10,
    33,
    17,
    10,
    128,
    18,
    5,
    88,
    19,
    1,
    60,
    20,
    10,
    8,
    21,
    10,
    6,
    22,
    5,
    37,
    23,
    1,
    39,
    24,
    1,
    44,
    25,
    10,
    56,
    26,
    10,
    113,
    27,
    1,
    151,
    28,
    10,
    200,
    29,
    10,
    101,
    30,
    5,
    21,
    31,
    1,
    93,
    32,
    10,
    176,
    33,
    10,
    19,
    34,
    1,
    146
  ];

  string[] internal text_traits = [
    "\u0071\u0047\u0039\u003e\u0049\u0074\u003f\u0070\u0020\u0063\u0048\u0027\u0029\u0059\u0040",
    "\u002b\u002a\u0021\u2400\u002e\u0078\u0050\u0028\u002f\u003d\u0038\u005c\u2410\u0074\u2402",
    "\u0079\u0075\u002b\u007c\u004d\u0038\u007d\u0022\u0068\u0075\u007c\u004d\u0074\u002a\u0029",
    "\u002c\u2401\u0064\u007e\u0021\u007a\u0029\u2412\u2416\u0065\u0029\u007d\u2407\u2413\u241d",
    "\u0065\u0061\u0057\u0047\u0020\u2405\u007e\u2400\u0025\u0047\u2403\u2414\u007b\u240a\u240f",
    "\u0029\u2405\u0043\u0033\u0052\u0040\u0064\u2404\u0047\u0060\u007c\u002b\u240b\u003b\u0032",
    "\u0064\u002d\u2401\u0032\u2411\u0075\u006b\u005c\u0057\u0020\u0022\u002a\u0059\u240f\u0078",
    "\u0021\u003f\u241f\u0035\u0051\u007a\u0069\u006f\u0025\u0078\u2411\u241e\u0046\u004b\u0029",
    "\u0063\u0058\u2400\u002a\u002b\u0035\u0026\u0042\u0076\u0072\u0078\u002f\u0064\u0078\u0053",
    "\u0065\u2409\u0024\u241a\u0039\u0052\u241d\u2410\u003f\u0061\u0027\u002b\u0074\u007e\u0062",
    "\u2408\u0037\u0023\u0036\u0023\u0023\u007b\u241d\u005b\u240f\u0032\u0024\u002c\u004b\u241b",
    "\u0044\u2404\u0031\u0071\u0064\u0035\u240d\u0041\u007d\u004d\u2417\u0034\u004d\u002e\u0027",
    "\u0066\u2402\u2421\u003a\u2411\u0066\u007b\u0049\u241c\u004e\u0047\u0050\u006d\u2412\u005a",
    "\u2406\u0049\u004d\u2415\u2418\u241b\u0021\u002c\u240f\u003b\u0075\u0076\u0048\u0078\u005b",
    "\u0032\u005c\u240f\u004a\u003a\u0030\u0076\u0033\u0061\u0069\u0059\u0035\u0028\u0033\u2418",
    "\u2421\u240b\u0048\u0043\u005f\u0043\u0043\u2414\u0028\u0029\u0060\u241c\u0075\u240d\u241f",
    "\u007a\u2403\u0063\u0071\u0048\u2413\u0023\u2404\u007d\u0058\u0072\u0029\u0035\u0028\u0033",
    "\u007a\u0027\u005c\u2410\u0052\u0077\u004d\u007e\u0021\u2404\u0075\u0062\u240e\u0047\u0074",
    "\u0041\u0059\u2419\u0047\u005d\u0060\u0079\u241a\u0076\u0075\u0065\u0074\u2416\u0067\u0071",
    "\u0036\u2408\u0023\u005e\u241c\u0039\u006d\u240e\u0022\u002f\u0079\u0060\u0042\u007c\u2410",
    "\u0048\u006e\u240f\u241c\u0035\u007b\u2412\u002e\u0055\u007b\u0040\u0057\u240b\u2407\u002f",
    "\u002c\u005e\u006b\u0036\u0025\u0029\u002d\u0034\u0056\u2400\u240f\u003c\u0056\u0078\u0059",
    "\u0063\u0075\u240f\u002f\u007e\u2407\u2408\u003d\u0032\u0052\u0064\u0039\u240d\u0065\u2409",
    "\u0047\u2405\u003f\u005e\u2412\u007c\u0065\u0054\u0030\u0068\u0053\u0060\u0023\u0028\u005e",
    "\u0020\u2405\u0023\u240c\u003d\u0024\u002a\u0027\u006b\u241d\u005a\u0037\u005c\u0070\u002e",
    "\u002f\u2400\u002a\u241c\u003d\u0028\u005c\u004e\u004d\u2416\u2410\u005f\u0061\u0029\u0036",
    "\u240d\u0033\u005c\u0056\u0076\u0047\u003b\u007a\u0061\u2410\u003a\u0035\u002e\u2415\u002a",
    "\u007a\u2407\u004e\u0054\u2411\u240f\u2417\u0075\u007e\u0067\u003f\u0063\u0054\u2416\u0023",
    "\u2419\u0061\u0039\u0060\u0055\u0042\u0028\u003c\u0056\u241d\u006c\u006f\u0064\u0069\u0040",
    "\u0069\u005c\u0067\u0024\u241b\u0059\u2409\u0033\u002a\u0057\u0038\u006b\u0037\u007d\u0038",
    "\u007a\u005c\u240d\u002f\u2405\u0038\u0037\u004c\u003c\u0033\u241e\u0028\u2414\u007d\u0028",
    "\u0032\u0051\u004c\u0043\u0020\u003b\u0054\u0021\u0032\u0028\u241f\u003d\u002d\u005a\u241b",
    "\u2406\u241a\u0063\u0041\u0044\u0058\u007e\u0040\u0047\u0070\u004b\u0066\u0076\u0047\u005f",
    "\u003d\u0074\u0078\u0027\u0033\u2404\u002e\u0078\u0077\u0068\u0044\u003f\u0055\u0074\u004a",
    "\u0031\u0045\u0067\u241c\u2415\u241e\u240d\u007b\u2405\u2400\u0038\u007c\u241c\u002f\u0063",
    "\u0073\u2402\u0048\u0037\u2403\u0049\u0037\u0059\u004c\u0071\u0075\u0028\u241d\u240c\u0052",
    "\u0048\u241e\u003b\u0064\u005e\u0039\u005e\u002b\u004f\u0073\u0048\u0059\u0029\u0056\u0043",
    "\u240f\u004c\u2409\u0038\u0033\u002f\u240a\u002f\u0049\u241e\u005c\u240c\u2414\u0076\u004d",
    "\u2401\u2418\u0035\u003f\u003a\u2419\u0071\u0042\u241e\u002e\u0047\u0059\u003e\u0032\u0041",
    "\u0079\u0072\u2419\u0076\u240d\u0067\u0039\u003d\u0079\u0055\u0064\u0042\u002b\u0023\u007c",
    "\u0026\u2412\u0077\u0070\u004d\u240d\u0023\u2411\u2402\u241a\u0070\u005a\u003d\u002d\u0022",
    "\u2402\u0054\u007d\u0038\u005f\u2414\u007e\u004b\u002d\u241a\u0044\u003a\u2421\u0037\u006c",
    "\u0058\u2411\u0034\u0057\u0063\u240e\u003f\u0036\u241e\u241b\u2407\u0027\u005f\u2402\u2406",
    "\u0046\u0039\u0038\u0068\u0033\u2416\u0070\u005b\u005e\u0028\u002c\u005b\u0025\u240d\u2413",
    "\u0067\u0065\u007c\u0075\u0026\u004d\u0070\u240e\u0048\u0036\u0027\u0071\u002a\u0026\u2419",
    "\u0031\u2400\u240c\u2403\u006a\u005a\u0061\u0071\u2409\u0035\u005d\u0050\u0060\u240f\u006b",
    "\u0069\u2407\u0067\u004a\u0077\u0051\u0050\u2407\u0074\u0040\u0064\u002d\u003a\u0066\u2407",
    "\u0047\u0073\u2418\u2412\u0046\u003f\u2417\u005b\u006a\u0052\u2417\u0062\u0033\u0043\u2404",
    "\u240b\u002c\u0051\u006a\u003d\u007a\u007d\u007c\u2404\u0037\u003a\u005c\u0064\u240b\u006c",
    "\u0032\u0057\u0026\u003b\u005e\u2416\u003a\u2413\u0036\u006e\u0034\u0023\u0069\u0048\u2411",
    "\u2401\u0068\u0022\u2400\u0078\u0057\u2409\u0034\u2417\u0021\u0075\u0068",
    "\u004d\u0032\u0027\u006f\u003a\u0078\u002f\u007d\u2421\u0072\u0058\u0040",
    "\u0069\u0071\u0059\u006f\u2410\u002f\u2421\u005a\u2418\u0030\u0062\u0071",
    "\u0059\u003f\u004f\u0035\u240f\u0030\u002c\u003c\u0073\u005a\u0071\u2413",
    "\u240f\u002d\u003d\u0074\u0024\u003f\u2418\u006b\u0066\u240b\u240f\u2409",
    "\u007d\u0037\u0040\u005e\u0076\u004c\u2416\u0062\u0071\u0069\u241c\u003b",
    "\u0030\u005b\u0023\u006c\u0064\u0025\u0071\u2421\u003d\u2400\u0052\u006e",
    "\u0036\u007e\u0024\u003f\u241b\u0069\u0075\u241c\u0020\u0079\u0038\u2403",
    "\u0050\u2421\u240f\u0028\u2406\u0039\u006e\u003e\u002a\u0063\u0046\u006d",
    "\u006d\u006b\u0045\u0033\u0074\u240b\u2410\u0060\u002b\u0071\u005d\u0021",
    "\u006f\u0078\u240a\u0021\u0046\u0061\u2404\u0061\u0069\u0028\u0057\u004f",
    "\u0023\u2415\u007c\u2417\u2407\u0056\u240a\u0066\u007b\u240c\u0047\u0054",
    "\u0041\u0027\u007c\u0043\u240a\u004f\u002c\u0039\u0075\u002f\u0041\u240f",
    "\u005e\u0065\u240f\u0071\u0020\u0074\u003a\u0038\u2409\u240b\u0061\u2419",
    "\u2406\u003d\u0068\u0045\u0074\u0057\u240f\u0037\u0021\u2407\u2412\u0037",
    "\u241c\u0049\u0057\u0068\u0046\u0063\u0058\u0055\u0070\u0063\u0020\u0022",
    "\u0061\u0070\u0077\u0042\u0054\u0037\u0056\u0061\u0041\u003a\u0079\u0033",
    "\u007b\u0041\u240c\u0053\u0061\u2405\u0029\u002a\u005e\u2413\u007c\u0032",
    "\u005e\u0052\u0031\u005f\u2409\u0039\u0075\u0022\u0062\u002f\u0032\u002e",
    "\u0065\u0029\u2408\u0035\u2404\u0064\u003f\u0075\u2403\u006c\u0077\u0077",
    "\u003f\u005a\u0051\u0053\u0047\u006a\u0032\u0051\u0048\u0034\u2402\u241f",
    "\u2421\u002b\u0051\u0045\u0024\u0053\u2407\u0026\u0057\u005d\u0037\u0067",
    "\u241a\u0039\u2417\u0024\u240e\u2419\u0033\u005f\u0056\u240b\u003f\u0033",
    "\u007b\u240f\u0070\u0069\u005b\u004f\u0068\u0024\u0077\u004a\u0050\u0033",
    "\u2412\u241d\u004f\u2408\u007b\u0062\u0065\u0038\u0029\u0040\u005d\u240e",
    "\u241f\u0021\u0067\u006c\u0074\u2417\u002a\u0062\u006e\u0024\u0023\u006d",
    "\u0035\u0070\u2410\u004f\u0043\u003c\u241f\u0071\u0067\u0035\u241d\u0045",
    "\u004d\u0058\u0061\u0028\u0025\u0065\u005e\u003d\u2409\u002a\u005f\u241c",
    "\u0026\u003d\u0041\u0052\u2414\u2407\u0042\u0030\u0021\u0038\u2402\u0079",
    "\u240e\u002e\u002c\u0060\u0072\u2405\u006b\u0054\u0056\u0046\u2408\u0073",
    "\u007b\u0034\u005a\u006d\u0071\u0062\u241b\u0024\u0039\u002d\u006f\u004e",
    "\u0065\u0077\u0071\u2410\u2406\u240a\u002f\u0031\u0026\u241a\u004f\u0059",
    "\u2418\u006d\u0043\u005c\u0058\u0037\u0035\u0063\u0070\u007b\u005c\u006a",
    "\u004e\u0061\u0025\u241e\u0071\u0044\u0025\u2414\u002d\u0054\u2418\u2416",
    "\u0031\u003b\u003e\u0047\u003f\u003c\u005c\u240c\u0051\u0033\u005c\u003d",
    "\u0041\u2414\u2406\u006d\u002a\u0050\u0029\u2415\u0029\u0058\u0053\u241b",
    "\u006a\u0067\u0043\u2417\u2406\u0035\u2403\u240a\u0023\u002d\u241f\u0061",
    "\u0031\u240c\u0025\u0047\u240a\u0078\u0042\u0063\u241e\u0026\u0037\u005b",
    "\u2406\u241a\u003d\u2409\u2416\u0058\u0026\u0047\u005c\u0027\u003c\u0023",
    "\u005a\u2417\u0049\u004a\u241a\u2409\u0072\u0071\u0043\u006e\u0063\u0034",
    "\u0026\u0078\u007b\u241c\u0069\u2400\u0046\u0059\u006e\u0021\u0034\u0055",
    "\u2409\u241c\u2419\u0031\u2400\u241c\u002c\u2414\u2413\u2415\u2404\u0061",
    "\u2400\u0032\u2418\u0024\u0078\u005f\u0076\u0074\u005d\u002d\u0060\u0026",
    "\u0074\u0059\u240c\u0036\u002c\u0025\u240d\u0057\u0066\u0068\u0049\u0043",
    "\u0045\u0050\u240e\u003b\u0028\u0021\u0040\u0075\u0020\u0073\u0046\u0054",
    "\u0029\u0042\u0063\u0046\u005a\u0045\u240c\u006b\u2413\u0077\u007c\u0039",
    "\u2400\u0056\u0064\u2411\u240b\u004d\u240c\u0043\u2405\u240b\u006f\u002a",
    "\u0053\u006c\u2403\u2400\u0065\u004b\u0052\u005b\u005f\u005d\u0028\u241a",
    "\u241b\u0062\u2403\u0040\u0027\u004d\u2409\u004d\u004d\u241a\u0030\u0054",
    "\u0073\u0058\u0067\u0030\u2401\u2417\u2421\u003a\u241c\u0020\u2411\u003f",
    "\u0064\u0028\u0030\u0075\u2400\u0054\u0021",
    "\u0039\u2413\u240c\u0022\u002b\u0067\u0034",
    "\u0023\u0067\u002b\u005e\u0033\u2409\u0021",
    "\u2411\u241b\u240b\u241e\u0043\u2401\u0021",
    "\u0034\u2418\u0034\u005c\u004f\u0062\u0049",
    "\u240c\u0052\u240c\u0047\u0076\u0025\u2417",
    "\u0054\u2410\u240b\u2415\u241a\u005a\u0057",
    "\u0046\u2409\u002f\u0027\u0037\u005f\u0055",
    "\u2417\u0040\u0030\u2410\u004b\u0060\u005c",
    "\u002e\u2412\u2403\u0072\u006b\u0043",
    "\u240b\u005b\u006c\u0071\u004d\u0069\u007c",
    "\u2414\u0054\u240a\u240f\u2411\u0027\u241c",
    "\u240c\u0054\u2418\u2418\u0040\u007a\u240b",
    "\u241c\u0069\u0068\u007d\u0054\u2409\u0051",
    "\u0074\u006d\u0020\u2421\u2404\u0056\u241f",
    "\u0030\u003e\u0055\u0040\u003d\u003a\u0026",
    "\u003f\u0033\u2407\u004e\u002a\u2410\u005e",
    "\u0024\u0022\u2401\u0051\u003e\u007e\u2402",
    "\u0073\u003d\u004f\u0052\u0035\u0047\u003e",
    "\u0052\u0067\u0056\u0068\u0056\u006a\u002b",
    "\u240c\u003a\u2416\u2404\u0031\u240d\u0062",
    "\u0052\u2411\u2416\u2400\u240c\u241a\u0074",
    "\u2409\u0077\u002a\u006c\u004f\u006c\u005a",
    "\u005f\u241f\u2418\u0079\u0069\u0061\u0053",
    "\u0048\u0048\u0038\u0056\u0039\u003f\u0024",
    "\u003c\u0068\u0050\u2408\u0078\u0037\u0075",
    "\u2403\u007a\u0038\u0064\u003e\u003e\u0040",
    "\u0047\u002b\u2406\u0032\u005c\u007a\u004c",
    "\u2400\u0042\u0037\u0049\u0038\u2415\u0061",
    "\u0049\u2421\u240e\u0066\u005c\u240d\u003a",
    "\u0059\u0027\u006e\u0071\u0072\u2402\u0028",
    "\u003b\u0043\u2403\u2418\u0047\u0059\u2410",
    "\u2400\u0069\u0041\u2418\u0048\u007d\u0067",
    "\u005d\u2415\u0040\u0032\u2415\u003d\u007b",
    "\u0037\u0021\u005c\u006e\u0032\u0027\u003c",
    "\u241f\u0069\u0027\u0075\u2401\u0055\u2417",
    "\u0027\u002a\u0052\u0058\u002f\u007a\u007c",
    "\u0049\u0062\u240d\u0043\u241a\u0056\u241d",
    "\u241d\u0024\u0070\u0061\u0039\u0045\u2407",
    "\u0021\u2402\u004f\u0053\u006a\u0072\u0033",
    "\u2409\u0079\u0025\u0039\u002a\u003d\u0063",
    "\u0070\u0040\u003c\u2414\u0067\u2415\u002e",
    "\u0037\u2405\u2407\u004e\u0066\u2418\u2408",
    "\u0055\u2419\u2406\u0028\u0043\u0049\u0059",
    "\u0028\u0079\u240c\u0033\u0022\u2418\u0054",
    "\u0068\u0024\u005e\u240e\u2413\u0064\u0072",
    "\u0079\u005f\u0020\u005f\u007a\u005a\u0047",
    "\u002f\u2421\u004b\u004b\u240a\u0074\u0069",
    "\u2415\u0055\u005a\u0037\u007e\u0035\u0061",
    "\u003e\u006c\u2415\u2402\u2419\u0049\u2402",
    "\u0074\u006d\u240b\u003a\u003d",
    "\u0070\u0056\u241e\u2409\u0064",
    "\u0060\u006e\u003b\u004e\u240c",
    "\u007c\u0070\u241b\u2407\u2414",
    "\u0050\u003c\u003d\u002f\u0054",
    "\u0070\u2412\u0068\u0044\u0076",
    "\u005a\u003b\u0054\u2411\u0024",
    "\u0078\u0062\u002c\u240e\u0047",
    "\u2409\u0066\u0028\u003b\u0043",
    "\u0020\u0020\u0020\u006f\u002f",
    "\u0072\u0031\u007d\u0077\u0038",
    "\u2412\u241e\u0058\u240f\u2421",
    "\u0033\u2413\u007c\u002e\u0025",
    "\u0047\u002f\u002c\u0061\u0026",
    "\u002b\u0045\u2414\u004b\u003a",
    "\u005a\u007b\u006b\u0058\u2416",
    "\u003f\u2409\u0066\u0035\u0021",
    "\u0032\u0062\u2405\u0072\u0062",
    "\u004d\u2403\u0048\u241a\u241c",
    "\u2410\u005c\u005a\u0024\u0051",
    "\u2404\u0059\u2419\u005b\u0043",
    "\u0031\u0057\u0036\u0069\u0077",
    "\u2419\u007e\u0041\u003a\u004b",
    "\u2400\u003f\u0056\u004c\u003d",
    "\u006f\u0024\u2405\u0026\u003d",
    "\u0057\u241e\u0045\u0032\u0077",
    "\u0068\u004c\u0065\u003e\u0042",
    "\u240e\u004a\u0072\u0033\u240f",
    "\u2414\u0047\u006c\u2400\u0066",
    "\u2406\u004f\u0036\u004c\u2413",
    "\u2403\u0031\u0022\u0027\u002f",
    "\u2405\u240b\u241d\u240a\u2402",
    "\u2408\u0071\u0044\u003e\u006d",
    "\u0022\u0026\u240c\u0078\u007a",
    "\u0036\u2414\u0073\u0050\u2419",
    "\u240c\u241e\u0059\u0037\u2401",
    "\u0021\u003c\u003f\u005a\u0053",
    "\u0077\u0035\u2404\u241f\u241a",
    "\u003b\u007b\u0072\u241f\u2404",
    "\u241d\u0073\u007c\u0039\u007e",
    "\u003f\u240b\u0059\u240d\u006c",
    "\u006e\u0069\u006e\u0043\u2415",
    "\u0065\u0055\u241b\u0022\u0063",
    "\u0031\u0060\u0035\u003d",
    "\u0059\u0052\u0068\u0043\u240b",
    "\u0034\u240b\u006e\u0049\u0072",
    "\u0032\u2401\u002d\u0030\u2418",
    "\u002f\u0028\u0076\u2407\u002a",
    "\u0060\u007e\u003e\u005e\u0053",
    "\u2413\u003b\u0049\u0042\u0056",
    "\u2417\u2409\u240b\u241f\u240a\u240b\u2404",
    "\u2421\u2402\u2400\u241d\u2416\u2418\u240a",
    "\u240b\u2411\u2405\u241a\u2411\u2403\u2401",
    "\u2401\u240e\u240d\u2407\u2404\u241e\u2410",
    "\u240d\u2412\u2414\u2401\u2409\u2415\u2419",
    "\u240c\u2419\u2408\u2414\u240c\u240b\u2419",
    "\u240b\u2401\u2413\u2401\u2411\u2410\u2409",
    "\u240a\u241b\u241e\u240e\u2411",
    "\u2403\u2400\u240a\u240d\u2411",
    "\u2418\u2415\u2421\u240c\u240b",
    "\u2403\u240f\u241c\u2407\u2404",
    "\u2409\u2411\u2406\u241c\u2415",
    "\u2400\u241c\u2419\u241b\u2421",
    "\u240c\u2400\u240f\u240e\u2408",
    "\u240c\u2408\u241f\u240e\u240d",
    "\u2410\u2403\u2408\u2416\u241b",
    "\u240b\u2417\u2401\u2419\u2416",
    "\u2411\u2412\u2400\u2409\u2410"
  ];
}
