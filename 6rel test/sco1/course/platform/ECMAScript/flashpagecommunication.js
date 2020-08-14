
// set a unique id for this page instance (only set once when page is loaded)
// this ensures that multiple pages don't override communication
var uniquePageId = new Date().getTime();

// return the sequential order of this kind (name) of flash movie on the page (0 first)
// utility function of setFlashCommName
function getFlashTypeOrder(oDocTree, oFlashNode) {
	// the name of the current node
	var nodeClass = oFlashNode.getAttribute("name");
	// cycle through all the objects on the page
	for (var x = 0, y = 0; x < oDocTree.getElementsByTagName("object").length; x++) {
		// if the document object and the passed node have the same name
		if (oDocTree.getElementsByTagName("object")[x].getAttribute("name") == nodeClass) {
			// check to see if they are the same, if they are, return the sequential order
			if (oFlashNode == oDocTree.getElementsByTagName("object")[x]) {
				return y;
			} else {
				// if they aren't the same, increment the order
				y++;
			}
		}
	}
}

// set all the flash communication flashvars parameters for all flash objects within a doc tree
function setAllFlashVarsParams(oDomTree) {

//	var flashNodes = oDomTree.selectNodes("//*[name()='object']");
	var flashNodes = oDomTree.selectNodes("//*[@type='application/x-shockwave-flash']");

	for (var i = 0; i < flashNodes.length; i++) {

		var oFlashNode = flashNodes[i];

		// Delete an existing flash vars params.
		var flashVarsNode = oFlashNode.selectNodes(".//param[@name='FlashVars']");
		while (flashVarsNode.length > 0) {
			oFlashNode.removeChild(flashVarsNode[0]);
		}

		// create the new param
		var oParam = oDomTree.createElement("param");

		// grab all the flashvars values
		var flashType = oFlashNode.getAttribute("name");
		var flashTypeOrder = getFlashTypeOrder(oDomTree, oFlashNode);
		var parentXmlUri = contentPageUri();

		// create a flashvars query string containing names and values for all this data
		var flashVarsString = "pageId=" + String(uniquePageId);	// from global variable
		flashVarsString += "&objectType=" + String(flashType);
		flashVarsString += "&objectOrder=" + String(flashTypeOrder);
		flashVarsString += "&parentXmlUri=" + String(parentXmlUri);
		flashVarsString += "&contentLanguage=" + getContentLanguage(parentXmlUri);

		// Pass a flashVars variable into Activities that are lacking an intro page.
		var activityNode = oDomTree.selectNodes("//*[@class='sortGame' or @class='tileFlip' or @class='dragAndDrop'][@type='application/x-shockwave-flash']")[0];
		// If there is an appropriate activity element on this page.
		if (activityNode != null) {
			// If the currently examined object element is indeed this activity element.
			if (activityNode == oFlashNode) {
				// If there is not an element before this element (the overview div).
				var prevousElement = activityNode.previousSibling;
				if (prevousElement == null) {
					// Add a FlashVars variable that tells the activity to start immediately.
					flashVarsString += "&quickStart=true";
				} else {
					// Add a FlashVars variable that tells the activity not to start immediately.
					flashVarsString += "&quickStart=false";
				}
			}
		}

		// If this is the content wheel.
		if (oFlashNode.getAttribute("id") == "contentWheel") {
			// Add some localization strings specific to the content wheel.
			flashVarsString += "&contentWheel_textView=" + gStrings["contentWheel_textView"];
			flashVarsString += "&contentWheel_wheelView=" + gStrings["contentWheel_wheelView"];
			flashVarsString += "&contentWheel_introduction=" + gStrings["contentWheel_introduction"];

			flashVarsString += "&contentWheel_finish1=" + gStrings["contentWheel_finish1"];
			flashVarsString += "&contentWheel_finish2=" + gStrings["contentWheel_finish2"];
			flashVarsString += "&contentWheel_finish3=" + gStrings["contentWheel_finish3"];
			flashVarsString += "&contentWheel_finish4=" + gStrings["contentWheel_finish4"];
			flashVarsString += "&contentWheel_finish5=" + gStrings["contentWheel_finish5"];

			flashVarsString += "&contentWheel_help=" + gStrings["contentWheel_help"];


// This used to be from setupContentWheel.
			// retrieve the wheel setup string
			var pageUrls = oFlashNode.childNodes.item(0).getAttribute("value");
			var pageTypes = oFlashNode.childNodes.item(1).getAttribute("value");
			var pageTitles = oFlashNode.childNodes.item(2).getAttribute("value");

			// determine the uiState
			var uiState = getCookie("uiState");
			if (typeof uiState == "undefined" || uiState == "") {
				var defaultsToTextView = gSettings["navigation_defaultsToTextView"];
				uiState = defaultsToTextView;
			}

			flashVarsString += "&currentPageUrls=" + pageUrls;
			flashVarsString += "&currentPageTypes=" + pageTypes;
			flashVarsString += "&currentPageTitles=" + pageTitles;
			flashVarsString += "&textBool=" + uiState;
			flashVarsString += "&currentPage=" + contentPageUri();
			flashVarsString += "&visitedPages=" + getCookie('visitedPages');
		}

		// add this flashvars attribute to the param element
		oParam.setAttribute("name", "FlashVars");
		oParam.setAttribute("value", flashVarsString);

		// append the param to the flash node
		oFlashNode.appendChild(oParam);
	}
}

// reset the send flash object after an actionscript call has been made
// not used
function resetFlashSend() {

	var oFlashNode = document.frames['send'].document.getElementById('flashCommSend');

	// remove all existing flash vars params
	for (var i = 0; i < oFlashNode.childNodes.length; i++) {
		if (oFlashNode.childNodes.item(i).getAttribute("name") == "FlashVars") {
			// there are existing flashvars, delete them
			oFlashNode.removeChild(oFlashNode.childNodes.item(i));
			i--;
		}
	}
	// do the innerHTML replace
	oFlashNode.parentNode.innerHTML = xmlStringFromDocDom(oFlashNode);
}

function sendCallToFlash(sDestinationFlashCommName, sFunctionName, sFunctionArgs) {

	var oFlashNode = document.frames['send'].document.getElementById('flashCommSend');

	// remove all existing flash vars params
	for (var i = 0; i < oFlashNode.childNodes.length; i++) {
		if (oFlashNode.childNodes.item(i).getAttribute("name") == "FlashVars") {
			// there are existing flashvars, delete them
			oFlashNode.removeChild(oFlashNode.childNodes.item(i));
			i--;
		}
	}

	// create the new param
	var oParam = document.frames['send'].document.createElement("param");

	// grab all the flashvars values
	var parentXmlUri = contentPageUri();

	// create a flashvars query string containing names and values for all this data
	var escapedUniquePageId = String(uniquePageId).replace(/&/g, "apuenlhjwuvhjfx");
	escapedUniquePageId = escapedUniquePageId.replace(/=/g, "dgkhweqnzpcv239");
	escapedUniquePageId = escapedUniquePageId.replace(/"/g, "5efjz8d5dbhdpie");
	escapedUniquePageId = escapedUniquePageId.replace(/%/g, "iajotcq8c34sneg");
	var flashVarsString = "pageId=" + escapedUniquePageId;	// from global variable
//	flashVarsString += "&parentXmlUri=" + String(parentXmlUri);
	flashVarsString += "&targetFlashObjectCommName=" + String(sDestinationFlashCommName);
	flashVarsString += "&functionName=" + String(sFunctionName);

	var escapedFunctionArgs = String(sFunctionArgs).replace(/&/g, "apuenlhjwuvhjfx");
	escapedFunctionArgs = escapedFunctionArgs.replace(/=/g, "dgkhweqnzpcv239");
	escapedFunctionArgs = escapedFunctionArgs.replace(/"/g, "5efjz8d5dbhdpie");
	escapedFunctionArgs = escapedFunctionArgs.replace(/%/g, "iajotcq8c34sneg");
	flashVarsString += "&functionArgs=" + escapedFunctionArgs;

	// add this flashvars attribute to the param element
	oParam.setAttribute("name", "FlashVars");
	oParam.setAttribute("value", flashVarsString);

	// append the param to the flash node
//	oFlashNode.appendChild(oParam);

	// Add the param to the object string.
	var updatedFlashXmlString = xmlStringFromDocDom(oFlashNode).slice(0, -9) + xmlStringFromDocDom(oParam) + xmlStringFromDocDom(oFlashNode).slice(-9);

	// do the innerHTML replace
	oFlashNode.parentNode.innerHTML = updatedFlashXmlString;
}

// Set the uiState - text vs. wheel mode of the content wheel.
function setUiState(textMode) {
	if (textMode == "text") {
		setCookie("uiState", "true");
	} else {
		setCookie("uiState", "false");
	}
}

// Get around the need to activate activeX content within IE.
function writeActiveContent(serialXml) {

	document.write(serialXml);
}

// HTML SCO Navigation //
function setScoNavState()
{
	// If this SCO has no inner-sco navigation.
	if ( document.getElementById( "scoNavigation" ) == null )
		return;

    var topicList = document.getElementById( "scoNavigation" ).childNodes[0].childNodes[0].childNodes;
	
    if(topicList.length > 8)
    {
        document.getElementById( "scoNavigation" ).style.overflowX="hidden"; 
        document.getElementById( "scoNavigation" ).style.overflowY="scroll"; 
        for ( var i = 0; i < topicList.length; ++i )
        document.getElementById( "scoNavigation" ).childNodes[0].rows[i].height = ((document.getElementById( "scoNavigation" ).clientHeight - 4)/8);
    }
	// The uris of all the topics in the SCO.
	var scoTopicUriArray = getScoTopicUris();
	// The array of all visited topics.
	var visitedTopicArray = getVisitedTopics();

	// If any of the SCO topics has been visited, modify the appearance of the scoNav.
	for ( var topicIndex in scoTopicUriArray ) {
		var scoTopic = scoTopicUriArray[ topicIndex ];

		for ( var visitedTopicIndex in visitedTopicArray ) {
			var visitedTopic = visitedTopicArray[ visitedTopicIndex ];

			if ( scoTopic == visitedTopic ) {
				setTopicDisplayVisited( scoTopic, scoTopicUriArray );

				break;
			}
		}
	}
	setCurrentTopicDisplay( scoTopicUriArray );
}

// Ensure that the content within the inner SCO links are truncated if they are too wide for the nav link list.
function truncateHtmlScoNavLinks() {

	// Run through each of the anchor elements in the nav list and truncate their text if they are too wide.
	if(document.getElementById( "scoNavigation" )!= null)
	{
	    var scoNavTopicList = document.getElementById( "scoNavigation" ).childNodes[0].childNodes[0];
	}
	// If there is a scoNavTopicList
	if ( scoNavTopicList != null ) {
		// For each of the sco nav topic list items.
		for ( var i = 0; i < scoNavTopicList.childNodes.length; ++i ) {
			var listItem = scoNavTopicList.childNodes[ i ];
			var listItemData = listItem.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1];
			var listItemTextNode = listItemData.firstChild;
			// Truncate the specified text node and add an elipse after truncated text nodes.
			truncateTextNode( listItemData, listItemTextNode, 460 );
		}
	}
}
// Remove trailing characters in a text node that is larger than the specified max width and end with a trailing elipse (...)
function truncateTextNode( measurementNodeRef, textNodeRef, maxWidth ) {
	var measurementNodeRefWidth = measurementNodeRef.offsetWidth;

	// Only truncate if the text is too large.
	if ( measurementNodeRefWidth > maxWidth ) {
		var elipse = "...";
		var textValue = String( textNodeRef.nodeValue );
		textValue += elipse;

		while ( measurementNodeRefWidth > maxWidth ) {
			// Remove the elipse.
			textValue = textValue.slice( 0, -4 );
			// Remove the last character.
			textValue = textValue.slice( 0, -1 );

			// Remove any trailing whitespace.
			while ( textValue.slice( -1 ) == ' ' || textValue.slice( -1 ) == '\t' || textValue.slice( -1 ) == '\n' ) {
				textValue = textValue.slice( 0, -1 );
			}

			// Re-Add the elipse
			textValue += elipse;

			// Update the text node.
			textNodeRef.nodeValue = textValue;
			// Re-measure the node width.
			measurementNodeRefWidth = measurementNodeRef.offsetWidth;
		}
	}
}

function getScoTopicUris()
{
	// Isolate the sco manifest.
	var scoManifestUri = loadedPageXmlDom.selectSingleNode("/topic/@lessonManifestUri").value;
	// Load the lesson manifest.
	var lessonManifestDom = new XmlDom();
	lessonManifestDom.load( scoManifestUri );
	// Create an array of topic uri attribute elements.
	var topicUriAttributeArray = lessonManifestDom.selectNodes("//topic/@uri");
	// Replace the topic uri attribute elements with uri strings;
	var topicUriStringArray = new Array();
	for ( var i = 0; i < topicUriAttributeArray.length; ++i )
		topicUriStringArray.push( topicUriAttributeArray[i].value );

	return topicUriStringArray;
}

function getVisitedTopics()
{
	var visitedTopicUriString = getCookie('visitedPages');
	var visitedTopicUriArray = visitedTopicUriString.split( "^^" );

	return visitedTopicUriArray;
}

function setTopicDisplayVisited( topicUri, scoTopicUriArray )
{
	for ( var i = 0; i < scoTopicUriArray.length; ++i )
		if ( scoTopicUriArray[i] == topicUri )
			topicIndex = i;
	if ( typeof topicIndex == "undefined" ) // if the provided topic is not a member of the scoTopicUriArray, exit the function
		return;
	document.getElementById( "scoNavigation" ).childNodes[0].childNodes[0].childNodes[topicIndex].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].style.visibility = "visible";    		
}
function setCurrentTopicDisplay( scoTopicUriArray )
{
	var topicUri = contentPageUri();

	for ( var i = 0; i < scoTopicUriArray.length; ++i )
		if ( scoTopicUriArray[i] == topicUri )
			topicIndex = i;
	if ( typeof topicIndex == "undefined" ) // if the provided topic is not a member of the scoTopicUriArray, exit the function
		return;

	// Remove the "current" styling on any of the topics listed in the topicList.
	var topicList = document.getElementById( "scoNavigation" ).childNodes[0].childNodes[0].childNodes;
	for ( var i = 0; i < topicList.length; ++i )
	    topicList[i].firstChild.className = "";
    document.getElementById( "scoNavigation" ).childNodes[0].childNodes[0].childNodes[topicIndex].childNodes[0].className = "visited" ;
    
    if(topicList.length > 8)
	{
	    if(topicIndex > 7)
	    {
	        document.getElementById("scoNavigation").scrollTop = (topicIndex - 6) * (document.getElementById( "scoNavigation" ).childNodes[0].childNodes[0].childNodes[topicIndex].childNodes[0].clientHeight); 
	    }
	    else
	    {
	        document.getElementById("scoNavigation").scrollTop = 0;
	    }
	}
}

function topicMouseDown(sender)
{
    if(event.button == 1)
    {
        sender.childNodes[0].className = "current";
    }
}

function disableSelection(target)
{
    target.onselectstart=function()
    {
        return false;
    };
    target.unselectable="on";
    
    target.style.cursor = "default";
}

// SIG // Begin signature block
// SIG // MIIbDwYJKoZIhvcNAQcCoIIbADCCGvwCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFHwoa0OFvYRP
// SIG // 12IBuk0FiZW6+FQ5oIIV6jCCBIUwggNtoAMCAQICCmEF
// SIG // 9x4AAAAAADIwDQYJKoZIhvcNAQEFBQAweTELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0IENv
// SIG // ZGUgU2lnbmluZyBQQ0EwHhcNMDkwNzEzMjMwMDE4WhcN
// SIG // MTAxMDEzMjMxMDE4WjCBgzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjENMAsGA1UECxMETU9QUjEeMBwGA1UEAxMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAtYypnJSEYRrMLiLEoJNkCd6F
// SIG // obCQXfzJbGi18e/8jmv0+KBu11HeYKMnY9T237ZM0kUL
// SIG // pz3Yb/7tpxhj0x/GgdS/BzeXQCt/519aNdmTT6vzKpLw
// SIG // po2B7AUk3Nu4YWNTYQI1ONa49e57VKbJWDXp9BXv2gds
// SIG // BS1NpLa6mzu4MTB+RbypoSU5DEOkRzuXnCBEcjfPUKBN
// SIG // TfTDZdxE0Qg7ON0+xRdsRsetcyTAj4nB6uq6zWipEtZY
// SIG // DFMWDP45A9aB8j5cV/N622bhBxjZGQMU9uZFmSpRTJDX
// SIG // Wu+vtzsMKU1tIK4Ht5Iu6GnKnzBC58MyigsiSjLonAzG
// SIG // UQMmAW2ScwIDAQABo4IBAjCB/zATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDAzAdBgNVHQ4EFgQUh4G33+76d/pZBWM3BArX
// SIG // 6dqg4OAwDgYDVR0PAQH/BAQDAgeAMB8GA1UdIwQYMBaA
// SIG // FFdFdBxdsPbIQwXgjFQtjzKn/kiWMEkGA1UdHwRCMEAw
// SIG // PqA8oDqGOGh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL0NvZGVTaWdQQ0EuY3JsME0G
// SIG // CCsGAQUFBwEBBEEwPzA9BggrBgEFBQcwAoYxaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9Db2Rl
// SIG // U2lnUENBLmNydDANBgkqhkiG9w0BAQUFAAOCAQEANiGE
// SIG // 9Y+DIU2HqD+L58WkD0wwbll0mwuXdBapsfNwpK/CDDMk
// SIG // 86BK+sHkIca22epcW5Fh9yJt/zH8F07XzUDjndLltNL6
// SIG // jWwH2neayivuDVlHzwTCEGf66ulDO7fm0ZzZjiNgbhKb
// SIG // w9l+XFcy3ZQN333FSJJNSHa3osBTlT78OqOTfPKFBMfG
// SIG // hTiXNvgSkyIAmU55r5brWiCDrNBcWjCwAOJrOY8kido9
// SIG // DKRGeWI2U2rXyc2SCPuH5VT1fFnFxHd9sMEsmMeXbEOn
// SIG // +CD4g1RknmD44kqlZ9RJv1SIfVJE81HAJtHFfPCJ1hEJ
// SIG // KMJFRYAdkCK9jqIFPjyzT73XOeCIkzCCBM0wggO1oAMC
// SIG // AQICCmEWtSkAAAAAABAwDQYJKoZIhvcNAQEFBQAwdzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBMB4XDTEwMDEwNDIxMTIw
// SIG // M1oXDTEzMDEwNDIxMjIwM1owgbYxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xEDAOBgNVBAsTB25DaXBoZXIxJzAlBgNVBAsT
// SIG // Hm5DaXBoZXIgRFNFIEVTTjpBQ0QzLUFFNjYtRTBCNTEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
// SIG // ggEBAOMoqtk8Q0L4BhO64sf5wS9ZyzyV51SQbMNYlWKz
// SIG // D2y9g9stWIgIkgvbzXbHVsbg7irTiDtcyqlwowAjIixT
// SIG // OOhQx/EUCY0dy3yL9aYza6/IRl9Le17556bHL0KFZzaN
// SIG // YEryE2bcsDltzhDK3XIFWHKd8gA7ADntJlM+Hs3uUJLN
// SIG // hfQ6/YGhBV8L6UQO79VZQCYoy4JOTivIFCK7cB3kPdH9
// SIG // YHZUTDns73c4i4z+dK/nFvRwMbjLrdTdi7b6AK3tdBSw
// SIG // Rb78ZYjhrfxJ21/R1M50edSNhm+z9ZcHIS2aYcn8uhtM
// SIG // 0uiruVDk0yv0wdlN1kCsFKeIhXNeaD5jt0HUZr0CAwEA
// SIG // AaOCARkwggEVMB0GA1UdDgQWBBTh8K4PDQX8MvMcfRl/
// SIG // z8TFv5FVTTAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7
// SIG // syuwwzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsG
// SIG // AQUFBwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3Nv
// SIG // ZnRUaW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsG
// SIG // AQUFBwMIMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0B
// SIG // AQUFAAOCAQEAjVtJKFSHyYqpk/6b+I1UcSCdwDiTJym5
// SIG // y5ZTios1tZQ3Fli9nj4XJ19ZL+Rdfh3iWdwH+2IY5WO/
// SIG // 9AvPTdpbMPbImv8mWb8ZwxCy8OMewQyZ2lWSxswS38BY
// SIG // TN2a1B0j+YYSROcmAuiAQWgWVDYdp2WzxDOh46SY2b5i
// SIG // kE+SN7apiBdUSB+dwiLYciq5wzCTPjfsKam5zgvVwskW
// SIG // pudeVQ3MgYRh6SwD25umG1MCOIsKWJEXyHFwFs4uxmP8
// SIG // eZ+DBIK0gecvV2mtuKUfIzZ29hWUhgoe6t0RO2ZE0hVa
// SIG // z6YrKB9OxQpzV0uVA2Ci6+kyfr09j6a9SSopwVcxwBDf
// SIG // UTCCBgcwggPvoAMCAQICCmEWaDQAAAAAABwwDQYJKoZI
// SIG // hvcNAQEFBQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZ
// SIG // MBcGCgmSJomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UE
// SIG // AxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0
// SIG // aG9yaXR5MB4XDTA3MDQwMzEyNTMwOVoXDTIxMDQwMzEz
// SIG // MDMwOVowdzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UE
// SIG // AxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBMIIBIjAN
// SIG // BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn6Fssd/b
// SIG // SJIqfGsuGeG94uPFmVEjUK3O3RhOJA/u0afRTK10MCAR
// SIG // 6wfVVJUVSZQbQpKumFwwJtoAa+h7veyJBw/3DgSY8InM
// SIG // H8szJIed8vRnHCz8e+eIHernTqOhwSNTyo36Rc8J0F6v
// SIG // 0LBCBKL5pmyTZ9co3EZTsIbQ5ShGLieshk9VUgzkAyz7
// SIG // apCQMG6H81kwnfp+1pez6CGXfvjSE/MIt1NtUrRFkJ9I
// SIG // AEpHZhEnKWaol+TTBoFKovmEpxFHFAmCn4TtVXj+AZod
// SIG // UAiFABAwRu233iNGu8QtVJ+vHnhBMXfMm987g5OhYQK1
// SIG // HQ2x/PebsgHOIktU//kFw8IgCwIDAQABo4IBqzCCAacw
// SIG // DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUIzT42VJG
// SIG // cArtQPt2+7MrsMM1sw8wCwYDVR0PBAQDAgGGMBAGCSsG
// SIG // AQQBgjcVAQQDAgEAMIGYBgNVHSMEgZAwgY2AFA6sgmBA
// SIG // VieX5SUT/CrhClOVWeSkoWOkYTBfMRMwEQYKCZImiZPy
// SIG // LGQBGRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWljcm9z
// SIG // b2Z0MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBDZXJ0
// SIG // aWZpY2F0ZSBBdXRob3JpdHmCEHmtFqFKoKWtTHNY9AcT
// SIG // LmUwUAYDVR0fBEkwRzBFoEOgQYY/aHR0cDovL2NybC5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvbWlj
// SIG // cm9zb2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUFBwEBBEgw
// SIG // RjBEBggrBgEFBQcwAoY4aHR0cDovL3d3dy5taWNyb3Nv
// SIG // ZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRSb290Q2Vy
// SIG // dC5jcnQwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZI
// SIG // hvcNAQEFBQADggIBABCXisNcA0Q23em0rXfbznlRTQGx
// SIG // LnRxW20ME6vOvnuPuC7UEqKMbWK4VwLLTiATUJndekDi
// SIG // V7uvWJoc4R0Bhqy7ePKL0Ow7Ae7ivo8KBciNSOLwUxXd
// SIG // T6uS5OeNatWAweaU8gYvhQPpkSokInD79vzkeJkuDfcH
// SIG // 4nC8GE6djmsKcpW4oTmcZy3FUQ7qYlw/FpiLID/iBxoy
// SIG // +cwxSnYxPStyC8jqcD3/hQoT38IKYY7w17gX606Lf8U1
// SIG // K16jv+u8fQtCe9RTciHuMMq7eGVcWwEXChQO0toUmPU8
// SIG // uWZYsy0v5/mFhsxRVuidcJRsrDlM1PZ5v6oYemIp76Kb
// SIG // KTQGdxpiyT0ebR+C8AvHLLvPQ7Pl+ex9teOkqHQ1uE7F
// SIG // cSMSJnYLPFKMcVpGQxS8s7OwTWfIn0L/gHkhgJ4VMGbo
// SIG // QhJeGsieIiHQQ+kr6bv0SMws1NgygEwmKkgkX1rqVu+m
// SIG // 3pmdyjpvvYEndAYR7nYhv5uCwSdUtrFqPYmhdmG0bqET
// SIG // pr+qR/ASb/2KMmyy/t9RyIwjyWa9nR2HEmQCPS2vWY+4
// SIG // 5CHltbDKY7R4VAXUQS5QrJSwpXirs6CWdRrZkocTdSIv
// SIG // MqgIbqBbjCW/oO+EyiHW6x5PyZruSeD3AWVviQt9yGnI
// SIG // 5m7qp5fOMSn/DsVbXNhNG6HY+i+ePy5VFmvJE6P9MIIG
// SIG // gTCCBGmgAwIBAgIKYRUIJwAAAAAADDANBgkqhkiG9w0B
// SIG // AQUFADBfMRMwEQYKCZImiZPyLGQBGRYDY29tMRkwFwYK
// SIG // CZImiZPyLGQBGRYJbWljcm9zb2Z0MS0wKwYDVQQDEyRN
// SIG // aWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp
// SIG // dHkwHhcNMDYwMTI1MjMyMjMyWhcNMTcwMTI1MjMzMjMy
// SIG // WjB5MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpN
// SIG // aWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQTCCASIwDQYJ
// SIG // KoZIhvcNAQEBBQADggEPADCCAQoCggEBAJ+N34U3jLEG
// SIG // VmY2TtQK6zYjkR6vq41Y6cTPwZ86CiTExMResO4VFMX6
// SIG // PpkzaxlpcvR8BV/lmSVE1zUZipDcKI6QDO/VkGGt3twY
// SIG // cC2DyW+vhSz43bm5MP1xeByD/cipuYJnDXq4wQnCvBaX
// SIG // Vz8cmNNp1zCQkJCNMB/YJtSee4jZ4gntl0lF6wRSgXV7
// SIG // uLUiuC5Wu9fPqU48CoOiqDrFrbYBDmrPIrQjH2zVJ+e3
// SIG // fsG01TKteSUcQobinYX0V9obWS8tJpIpxbPXhaOeYFqU
// SIG // 5nuce16CNEtt/9TuJ9Ci3NGQDM59DhV8iKw0x8BsmIRK
// SIG // yUR5aCjfIoMNuIosSGHi/hECAwEAAaOCAiMwggIfMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRXRXQcXbD2
// SIG // yEMF4IxULY8yp/5IljALBgNVHQ8EBAMCAcYwDwYDVR0T
// SIG // AQH/BAUwAwEB/zCBmAYDVR0jBIGQMIGNgBQOrIJgQFYn
// SIG // l+UlE/wq4QpTlVnkpKFjpGEwXzETMBEGCgmSJomT8ixk
// SIG // ARkWA2NvbTEZMBcGCgmSJomT8ixkARkWCW1pY3Jvc29m
// SIG // dDEtMCsGA1UEAxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlm
// SIG // aWNhdGUgQXV0aG9yaXR5ghB5rRahSqClrUxzWPQHEy5l
// SIG // MFAGA1UdHwRJMEcwRaBDoEGGP2h0dHA6Ly9jcmwubWlj
// SIG // cm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL21pY3Jv
// SIG // c29mdHJvb3RjZXJ0LmNybDBUBggrBgEFBQcBAQRIMEYw
// SIG // RAYIKwYBBQUHMAKGOGh0dHA6Ly93d3cubWljcm9zb2Z0
// SIG // LmNvbS9wa2kvY2VydHMvTWljcm9zb2Z0Um9vdENlcnQu
// SIG // Y3J0MHYGA1UdIARvMG0wawYJKwYBBAGCNxUvMF4wXAYI
// SIG // KwYBBQUHAgIwUB5OAEMAbwBwAHkAcgBpAGcAaAB0ACAA
// SIG // qQAgADIAMAAwADYAIABNAGkAYwByAG8AcwBvAGYAdAAg
// SIG // AEMAbwByAHAAbwByAGEAdABpAG8AbgAuMBMGA1UdJQQM
// SIG // MAoGCCsGAQUFBwMDMA0GCSqGSIb3DQEBBQUAA4ICAQAw
// SIG // vLAgpGKgp+85JmE93KzGmdCGxC71gzJlXiI+m9aG+Oi2
// SIG // n8qL1jt1C6GRPkzdZHSMSfKIjBhnbP4VZka4OkZCl8iR
// SIG // N9Qksees0+pBFIN308lPBV+jFFK/lqQvPlZbEHXOU8PO
// SIG // BVRptGXJJKUP4SW4GrlN5QK5UB5Ps5gMHZUC7iJZrSLL
// SIG // BXQLBEV7BFng2A+z60z4YN3CeJ7Rup9r9/PufkQRQNK9
// SIG // uptLFghupL5V5KY4EqNI9BxVeoog0X3+kduUjy/Ce2um
// SIG // ZIVPo+UsNCldC7/1xzgvxCDEVjH2ac6F+AqR7NDWrro4
// SIG // BQzrbk9MnAMpqqL8GKApDA1cXFYjV9oclg3IJjbBRMvl
// SIG // 4eZvieeP6Zi1c9N44+2jATx05V68bPYhiWcF7JedtbH9
// SIG // r6bpcqXDNOEvn/n0ajniLQSCW/zQnK58nRH55rVTGXS6
// SIG // OUo5631Cs0o7Nz3CSnsnmOfiTpsbSlQ4aiM3vmq3SO7q
// SIG // Qg1JJJGOtwQul2/k50W7j039YNnXWcLYgNZgNHu3oZMg
// SIG // /oG4qqVcCemKDb4oTX7X6A/tZXjRMV+5ZtvfQucLzAIH
// SIG // jd//IAajRWW0szKNLpHiTbSpyfq8awQOsp/qn96kyQqW
// SIG // 9I332Jio8IUCCFmkIKYsCxryUgbtaeVkGBvgo6veynwU
// SIG // YUO4ZfU2o1UTK2csTRswTDGCBJEwggSNAgEBMIGHMHkx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xIzAhBgNVBAMTGk1pY3Jv
// SIG // c29mdCBDb2RlIFNpZ25pbmcgUENBAgphBfceAAAAAAAy
// SIG // MAkGBSsOAwIaBQCggb4wGQYJKoZIhvcNAQkDMQwGCisG
// SIG // AQQBgjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQB
// SIG // gjcCARUwIwYJKoZIhvcNAQkEMRYEFBabftQwSDNAw9cH
// SIG // d3I2ouN/JlpLMF4GCisGAQQBgjcCAQwxUDBOoCaAJABN
// SIG // AGkAYwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4A
// SIG // Z6EkgCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVh
// SIG // cm5pbmcgMA0GCSqGSIb3DQEBAQUABIIBACvIvhtUypdu
// SIG // LbvDOW7vwOz6JmiI7IEUL1q7zwjXO0T1e0qqpnJb2OKJ
// SIG // UgdCWUG6DFHt+F4RCCyvdfjDg34NIhfLywcidzujZ7sy
// SIG // 8ZbOKhovlDTkYGAMXBNfB8qHfwGlTb43SJhbnXFholiw
// SIG // 8hzvflngj+hdeYXKo9lA4u6OkKonmtYgJiHPjq4y4pwg
// SIG // g3bzsuUnZOk+fyopPmXOVoVv+38zTa6lbaNDwGhJG95y
// SIG // 6aJBoJ9tg8hMIU9eWIiRjnOCd3DgHAyTYRqqj4g+ZT7E
// SIG // EkkFqnouFtxFCwKmwW5mrye8Rzsk+BGbnEpVjUMbNnlP
// SIG // WKNt6/o4Wq8HYSsEZlkrBJqhggIdMIICGQYJKoZIhvcN
// SIG // AQkGMYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBAgphFrUpAAAAAAAQMAcGBSsOAwIaoF0wGAYJ
// SIG // KoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0B
// SIG // CQUxDxcNMTAwMjE5MjIzNzE5WjAjBgkqhkiG9w0BCQQx
// SIG // FgQU9ZXjRgKKsmsRHCrQfg9qowfiLIcwDQYJKoZIhvcN
// SIG // AQEFBQAEggEAcBpA+FRRtkhaD4qCNFC1bCIPCIYb/9i2
// SIG // ofS0PTYWOi5BydRmXOhXYwLXVRZOocHvvBQYt8NvnKq1
// SIG // rvUpoEIblLtmoqMmMOCBJcb0JVT2jlfdeh/CbDR4xfbq
// SIG // mchNOhc1V2O3I8xRYgqyoD97FtY0neEOwVCIUdpItyRj
// SIG // +1yVluiimNP+7YtuzY2wXPbP/aNl/wnmb/qUw/pyL94I
// SIG // WfO4GDGa59PVJ1Z9HS5DhWHH77fJDnuSqml8AN2ZYRoA
// SIG // DIyYzWb06qs7BUbdHHSWKLCdDlxQPXtEN7ME3ZKkeeBT
// SIG // YEuVfRhDvrw9dEPOJDoSE49cdoRuzleU1YgY7BkTMnaMrg==
// SIG // End signature block
