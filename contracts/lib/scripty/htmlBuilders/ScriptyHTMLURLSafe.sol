// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

///////////////////////////////////////////////////////////
// ░██████╗░█████╗░██████╗░██╗██████╗░████████╗██╗░░░██╗ //
// ██╔════╝██╔══██╗██╔══██╗██║██╔══██╗╚══██╔══╝╚██╗░██╔╝ //
// ╚█████╗░██║░░╚═╝██████╔╝██║██████╔╝░░░██║░░░░╚████╔╝░ //
// ░╚═══██╗██║░░██╗██╔══██╗██║██╔═══╝░░░░██║░░░░░╚██╔╝░░ //
// ██████╔╝╚█████╔╝██║░░██║██║██║░░░░░░░░██║░░░░░░██║░░░ //
// ╚═════╝░░╚════╝░╚═╝░░╚═╝╚═╝╚═╝░░░░░░░░╚═╝░░░░░░╚═╝░░░ //
///////////////////////////////////////////////////////////
//░░░░░░░░░░░░░    GENERIC URL SAFE HTML    ░░░░░░░░░░░░░//
///////////////////////////////////////////////////////////
//
// This module is designed to generate URL safe HTML with head and body tags.
//
// eg;
//     <html>
//        <head>
//             <title>Hi</title>
//             <style>[css code]</style>
//         </head>
//         <body>
//             <canvas id="canvas"></canvas>
//             <script>[SCRIPT]</script>
//             <script type="text/javascript+gzip" src="data:text/javascript;base64,[SCRIPT]"></script>
//         </body>
//     </html>
//
///////////////////////////////////////////////////////////

/**
  @title Generates URL safe HTML after fetching and assembling given head and body tags.
  @author @0xthedude
  @author @xtremetom

  Special thanks to @cxkoda, @frolic and @dhof
*/

import "./../core/ScriptyCore.sol";
import "./../interfaces/IScriptyHTMLURLSafe.sol";

contract ScriptyHTMLURLSafe is ScriptyCore, IScriptyHTMLURLSafe {
  using DynamicBuffer for bytes;

  // =============================================================
  //                      RAW HTML GETTERS
  // =============================================================

  /**
   * @notice  Get URL safe HTML with requested head tags and body tags
   * @dev Any tags with tagType = 1/script are converted to base64 and wrapped
   *      with <script src="data:text/javascript;base64,[SCRIPT]"></script>
   *
   *      [WARNING]: Large non-base64 libraries that need base64 encoding
   *      carry a high risk of causing a gas out. Highly advised the use
   *      of base64 encoded scripts where possible
   *
   *      Your HTML is returned in the following format:
   *
   *      <html>
   *          <head>
   *              [tagOpen[0]][contractRequest[0] | tagContent[0]][tagClose[0]]
   *              [tagOpen[1]][contractRequest[0] | tagContent[1]][tagClose[1]]
   *              ...
   *              [tagOpen[n]][contractRequest[0] | tagContent[n]][tagClose[n]]
   *          </head>
   *          <body>
   *              [tagOpen[0]][contractRequest[0] | tagContent[0]][tagClose[0]]
   *              [tagOpen[1]][contractRequest[0] | tagContent[1]][tagClose[1]]
   *              ...
   *              [tagOpen[n]][contractRequest[0] | tagContent[n]][tagClose[n]]
   *          </body>
   *      </html>
   * @param htmlRequest - HTMLRequest
   * @return Full HTML with head and body tags
   */
  function getHTMLURLSafe(HTMLRequest memory htmlRequest) public view returns (bytes memory) {
    // calculate buffer size for requests
    uint256 requestBufferSize;
    unchecked {
      if (htmlRequest.headTags.length > 0) {
        requestBufferSize = _enrichHTMLTags(htmlRequest.headTags, true);
      }

      if (htmlRequest.bodyTags.length > 0) {
        requestBufferSize += _enrichHTMLTags(htmlRequest.bodyTags, true);
      }
    }

    bytes memory htmlFile = DynamicBuffer.allocate(_getHTMLURLSafeBufferSize(requestBufferSize));

    // data:text/html,
    htmlFile.appendSafe(DATA_HTML_URL_SAFE);

    // <html>
    htmlFile.appendSafe(HTML_OPEN_URL_SAFE);

    // <head>
    htmlFile.appendSafe(HEAD_OPEN_URL_SAFE);
    if (htmlRequest.headTags.length > 0) {
      _appendHTMLURLSafeTags(htmlFile, htmlRequest.headTags);
    }
    htmlFile.appendSafe(HEAD_CLOSE_URL_SAFE);
    // </head>

    // <body>
    htmlFile.appendSafe(BODY_OPEN_URL_SAFE);
    if (htmlRequest.bodyTags.length > 0) {
      _appendHTMLURLSafeTags(htmlFile, htmlRequest.bodyTags);
    }
    htmlFile.appendSafe(HTML_BODY_CLOSED_URL_SAFE);
    // </body>
    // </html>

    return htmlFile;
  }

  /**
   * @notice Calculates the total buffersize for all elements
   * @param requestBufferSize - Buffersize of request data
   * @return size - Total buffersize of all elements
   */
  function _getHTMLURLSafeBufferSize(uint256 requestBufferSize) private pure returns (uint256 size) {
    unchecked {
      // urlencode(<html><head></head><body></body></html>)
      size = URLS_SAFE_BYTES;
      size += requestBufferSize;
    }
  }

  /**
   * @notice Append URL safe HTML tags to the buffer
   * @dev If you submit a tag that uses tagType = .script, it will undergo a few changes:
   *
   *      Example tag with tagType of .script:
   *      console.log("Hello World")
   *
   *      1. `tagOpenCloseForHTMLTagURLSafe()` will convert the wrap to the following
   *      - <script>  =>  %253Cscript%2520src%253D%2522data%253Atext%252Fjavascript%253Bbase64%252C
   *      - </script> =>  %2522%253E%253C%252Fscript%253E
   *
   *      2. `_appendHTMLTag()` will base64 encode the script to the following
   *      - console.log("Hello World") => Y29uc29sZS5sb2coIkhlbGxvIFdvcmxkIik=
   *
   *      Due to the above, it is highly advised that you do not attempt to use `tagType = .script` in
   *      conjunction with a large JS script. This contract will try to base64 encode it which could
   *      result in a gas out. Instead use a a base64 encoded version of the script and `tagType = .scriptBase64DataURI`
   *
   * @param htmlFile - Final buffer holding all requests
   * @param htmlTags - Array of ScriptRequests
   */
  function _appendHTMLURLSafeTags(bytes memory htmlFile, HTMLTag[] memory htmlTags) internal pure {
    HTMLTag memory htmlTag;
    uint256 i;
    unchecked {
      do {
        htmlTag = htmlTags[i];
        (htmlTag.tagType == HTMLTagType.script)
          ? _appendHTMLTag(htmlFile, htmlTag, true)
          : _appendHTMLTag(htmlFile, htmlTag, false);
      } while (++i < htmlTags.length);
    }
  }

  // =============================================================
  //                      STRING UTILITIES
  // =============================================================

  /**
   * @notice Convert {getHTMLURLSafe} output to a string
   * @param htmlRequest - HTMLRequest
   * @return {getHTMLURLSafe} as a string
   */
  function getHTMLURLSafeString(HTMLRequest memory htmlRequest) public view returns (string memory) {
    return string(getHTMLURLSafe(htmlRequest));
  }
}
