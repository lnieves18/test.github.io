
var loadedPageXmlDom = new XmlDom();  // The currently loaded page's xml dom.
var xmlFileDom = new XmlDom();

var currentlyLoadedPage = "";		// the URI of the currently loaded page
var requestedContentUri = "";		// The requested content page URI.

var currentPageLanguage = "";

var firstPageLoading = true;		// Specifies if this is the first topic within the SCO to be loaded.

var scoAssessment = null;

var scriptElement = null;

var scriptLoadingInterval = 0;
var templateType = null;

var scriptElementReadyState = 0;
var needScript = true;
var pluginObject = null;

var globalStringsUri = null;
var globalStrings = null;

window.onload = function() {

	setCurrentGlobalSettings();

	// remove empty text nodes form the document DOM
	cleanWhitespace(document.documentElement);

	// If no content URI is appended to the preloader's URI, exit.
	if (typeof(getLoadedContentUri()) == "undefined") {
		return null;
	}

	// If this page is being previewed from the LCDS.
	if (window.parent!= null && typeof(window.parent.name) != "undefined" && typeof(window.parent.name) != "unknown") {
		var wName = String(window.parent.name);
		// If this course has been launched from the authoring environment in preview mode.
		if (wName.slice(0,8) == "preview_") {
// BUG!!!
			//
			var pageToLoad = wName.slice(8);

//			pageToLoad = unescape(pageToLoad);

			// Decode problem characters.
			pageToLoad = pageToLoad.replace(/apuenlhjwuvhjfx/g, "&");
			pageToLoad = pageToLoad.replace(/dgkhweqnzpcv239/g, "=");
			pageToLoad = pageToLoad.replace(/3904kjoqnxhdkfp/g, "?");
			pageToLoad = pageToLoad.replace(/18s2dfkgi70wqbo/g, ",");
			pageToLoad = pageToLoad.replace(/7ntdle8z3m14u9s/g, "-");
			pageToLoad = pageToLoad.replace(/6ebg3m25w2a2zfj/g, "@");
			pageToLoad = pageToLoad.replace(/yb1a6yp1mlivliu/g, "$");
			pageToLoad = pageToLoad.replace(/lvcz4pgx2ja1ixg/g, "'");
			pageToLoad = pageToLoad.replace(/gs7qbysk5kOl17f/g, "`");
			pageToLoad = pageToLoad.replace(/qvFtfK3Zkjp9oos/g, "~");
			pageToLoad = pageToLoad.replace(/Wu2qB8X2ph1CKjAn/g, "(");
			pageToLoad = pageToLoad.replace(/ge2Ast9zzqLaiQdv/g, ")");
			pageToLoad = pageToLoad.replace(/F6HRuuQxnwfM5rhF/g, "{");
			pageToLoad = pageToLoad.replace(/B2XslHvNGBqwlMQj/g, "}");
			pageToLoad = pageToLoad.replace(/DdnRwsHCzSAqurBVO/g, "[");
			pageToLoad = pageToLoad.replace(/G6tbyc10CChLtTUZA/g, "]");
			pageToLoad = pageToLoad.replace(/Bb4Wjf918mPyJEOOZC/g, ";");
			pageToLoad = pageToLoad.replace(/rexT4zTyXBxWvjE2RY/g, "^");
			pageToLoad = pageToLoad.replace(/J6U7sO2UaopgmuKsnES/g, "%");


			//	loadPage(getLoadedContentUri());	// should be this, but there is a bug in the viewer
			setTimeout("loadPage(\"" + pageToLoad + "\")", 500);
// BUG!!!
			window.parent.name = "previewWindow";
		} else {
			// Load the requested page into the content pane.
			loadPage(getLoadedContentUri());
		}
	} else {
		// Load the requested page into the content pane.
		loadPage(getLoadedContentUri());
	}
};

function loadScripts(){
    if(needScript)
    {
        if(window.ActiveXObject) 
        {
            if(scriptElement.readyState == 'loaded' || scriptElement.readyState == 'interactive' || scriptElement.readyState == 'complete')
            {
                window.clearInterval(scriptLoadingInterval);
                loadContent(xmlFileDom);
            }
        }else 
        {
            if (scriptElementReadyState == 4)
            {
                window.clearInterval(scriptLoadingInterval);
                loadContent(xmlFileDom);
            }
        }
    }else
    {
        window.clearInterval(scriptLoadingInterval);
        loadContent(xmlFileDom);
    }
}

// return the string following the hash mark in the page URI
// this corresponds to the base URI of the content page
function getLoadedContentUri() {
	var contentHashUri = document.location.hash.slice(1);
	if (contentHashUri.length == 0) {
		return;	// return null
	} else {
		return contentHashUri;
	}
}

// bRequiredXslt needs to be set to true if the page being downloaded is a required xslt for a content page
function loadPage(sRequestedContentUri) {

	// If this is the first page to be loaded, set all the global string variables.
	if (firstPageLoading == true) {
		setCurrentGlobalStrings(sRequestedContentUri);
	}

	// Convert to an xml file name.
	var xmlFileUri = sRequestedContentUri + ".xml";
	// Make the requested page's uri global.
	requestedContentUri = sRequestedContentUri;

	// if the currently loaded page is requested, exit out... don't waste any time
//	if (requestedContentUri == currentlyLoadedPage) {
//		return;
//	}

	// Load the xml file.
	var success = xmlFileDom.load(xmlFileUri);
	encodeSingleWhitespaceNodes(xmlFileDom);
	if (success != true) {
		alert(gStrings.xml_load);
		return false;
	}

	 templateType = xmlFileDom.selectNodes("/topic/@type")[0].value;
	
	//Download required script elements
	var headElement = document.documentElement.firstChild;
	scriptElement = document.createElement("script");
	scriptElement.setAttribute("type", "text/javascript");
	scriptLoadingInterval = window.setInterval(loadScripts,50);
	needScript = true;
	switch (templateType)
	{
	    case "labScenario000":
	        // Initialize EK vlab functionality if the settings.xml file defines that this course supports it
	        if ( gSettings.vmLab_support == "true" ) 
	        {
		        scriptElement.setAttribute("src", "platform/ECMAScript/ek_vlab.js" );
		        break;
	        }
	        break;
	    case "multipleChoice000":
	    case "trueFalse000":
	    case "essayQuestion000":
	        scriptElement.setAttribute("src", "platform/ECMAScript/scoassessment.js");
        break;
	        default: needScript = false;
    }
    if(needScript)
    {
        //Set the readystate for Firefox
	    if(!window.ActiveXObject)
	        scriptElement.onload=readyStateChanged;
	    headElement.appendChild(scriptElement);

	    if (templateType == "labScenario000") {

		    if (typeof smartlinkElement != "undefined" && smartlinkElement != null)
		    {
			    try
			    {
				    md=new ExtResMetadata(unescape(smartlinkElement));
				    if(md.hasError())
				    {
					    smartlinkElement=null;
				    }
			    }
			    catch(e)
			    {
				    smartlinkElement=null;
			    }
		    }
	    }
    }
}
function readyStateChanged()
{
    scriptElementReadyState = 4;
}
if(!window.ActiveXObject)
{
    HTMLElement.prototype.__defineSetter__("outerHTML", function(html) {
    var range = document.createRange();
    this.innerHTML = html;
    range.selectNodeContents(this);
    var frag = range.extractContents();
    this.parentNode.insertBefore(frag, this);
    this.parentNode.removeChild(this);
    });
}

function loadContent(xmlFileDom)
{
	// Isolate the xsl file uri.
	var xslFileUri = getXslt(xmlFileDom);

	// Isolate the sco manifest.
	var scoManifestUri = xmlFileDom.selectNodes("/topic/@lessonManifestUri")[0].value;

	// Load the xsl file.
	var xslFileDom = new XmlDom();
	var success = xslFileDom.load(xslFileUri);
	if (success != true) {
		alert(gStrings.xsl_load);
		return false;
	}

	// Create the Silverlight js object and inject the corresponding html dom into the transform.
	injectSilverLightActivityIntoTransform(xmlFileDom, xslFileDom);
// If the topic contains a media element with a .xaml asset, inject a Silverlight node tree into the transform.
	/*  Changes for multiple media - clickTableAnimation*/
	var upperCaseEnglishCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var lowerCaseEnglishCharacters = "abcdefghijklmnopqrstuvwxyz";

	var mediaUriLowerCase = "translate(@uri, " + upperCaseEnglishCharacters + ", " + lowerCaseEnglishCharacters + ")";
	var xamlUri = "substring(" + mediaUriLowerCase + ", (string-length(" + mediaUriLowerCase + ") - string-length('.xaml')) + 1) = '.xaml'";
	var wmvUri = "substring(" + mediaUriLowerCase + ", (string-length(" + mediaUriLowerCase + ") - string-length('.wmv')) + 1) = '.wmv'";

	// Check to see if the xaml content is in the content xml.
	var xPathString = "//*[name()='media'][" + xamlUri + " or " + wmvUri + "]";

	if (templateType != "media000") 
	{
	    var silverlightMediaElements = xmlFileDom.selectNodes(xPathString);
	    var mediaNodes = xmlFileDom.getElementsByTagName("media");
	    var currentMediaUri; var numberOfAnimations = 0;
	    if (mediaNodes.length > 1 && silverlightMediaElements.length > 1) { // silverlightMediaElements.length > 1, filters animation in Demo template.
	        for (var currentMedia = 0; currentMedia < mediaNodes.length; currentMedia++) {
	            if (mediaNodes[currentMedia] != null) {
	                currentMediaUri = mediaNodes[currentMedia].getAttribute("uri");
	                if ((currentMediaUri != "") && (currentMediaUri != null)) {
	                    if ((currentMediaUri.substring(currentMediaUri.length - 3)).toLowerCase() == "wmv" || (currentMediaUri.substring(currentMediaUri.length - 4)).toLowerCase() == "xaml") {
	                        // Create the Silverlight object for XAML animations and WMV demos.
	                        injectSilverLightMediaPlayerIntoTransform(xmlFileDom, xslFileDom, undefined, currentMedia + 1);
	                    }
	                }
	            }
	        }
	    } else if (mediaNodes.length > 2 && silverlightMediaElements.length > 0) { //issue : if single Animation in CTA is loaded into any other Row except 1st.
	        if (silverlightMediaElements[0].parentNode.nodeName == "td") {
	            var currentMediaPos = silverlightMediaElements[0].parentNode.getAttribute("title").slice(-1);
	            if (currentMediaPos == 0) {// if media is in 10th Row
	                currentMediaPos = silverlightMediaElements[0].parentNode.getAttribute("title").slice(-2);
	                if (currentMediaPos > 9)
	                    injectSilverLightMediaPlayerIntoTransform(xmlFileDom, xslFileDom, undefined, currentMediaPos);
	            } else if (currentMediaPos > 1) {
	                injectSilverLightMediaPlayerIntoTransform(xmlFileDom, xslFileDom, undefined, currentMediaPos);
	            } else if (currentMediaPos > 0) {
	                injectSilverLightMediaPlayerIntoTransform(xmlFileDom, xslFileDom, undefined, 0);
	            }
	        }
	    } else { // Except for Animations in CTA, all other template's animations.
	        if (silverlightMediaElements.length > 0) {
	            currentMediaUri = silverlightMediaElements[0].getAttribute("uri");
	            if (currentMediaUri != "" && currentMediaUri != null) {
	                if ((currentMediaUri.substring(currentMediaUri.length - 3)).toLowerCase() == "wmv" || (currentMediaUri.substring(currentMediaUri.length - 4)).toLowerCase() == "xaml")
	                    injectSilverLightMediaPlayerIntoTransform(xmlFileDom, xslFileDom, undefined, 0);
	            }
	        }
	    }
	}
	
/*  END :   Changes for multiple media - clickTableAnimation*/
	// Transform the xml using the transform.
	if(window.ActiveXObject)
	    var transformedTopicString = xmlFileDom.transformNode(xslFileDom);
    else
    {
        var oXSLTProcessor = new XSLTProcessor();
        oXSLTProcessor.importStylesheet(xslFileDom);
        oXSLTProcessor.setParameter("", "ActiveXObject", "false");
        var oXMLResult = oXSLTProcessor.transformToDocument(xmlFileDom); 
        var transformedTopicString = oXMLResult.xml;
    }

	// parse the newly transformed xml content
	var newNode = new XmlDom();
	newNode.loadXML(transformedTopicString);
	// remove whitespace nodes from the transformed content xml object
	cleanWhitespace(newNode);

	// Set the FlashVars for each flash object so that it can communicate with javascript and vice versa.
	setAllFlashVarsParams(newNode);

	// change the page url to match the current page
	var newPageUri = docUriMinusHash() + "#" + requestedContentUri;
	window.location.hash = requestedContentUri;

	// the page is finished loading, put its URI into the currentlyLoadedPage variable
	currentlyLoadedPage = requestedContentUri;
	// update the current page xml
	loadedPageXmlDom = xmlFileDom;

	// If this is the first page of the SCO that is loading, then load everything (including the content wheel).
	if (firstPageLoading == true) {

		document.getElementById("contentBlock").outerHTML = xmlString(newNode);

		// If this is the first page to be loaded and the assessment object has not been created, create it.
		if (templateType == "multipleChoice000" || templateType == "trueFalse000" || templateType == "essayQuestion000") 
		{
		    scoAssessment = new ScoAssessment(g_oAPI);
		}

		// The firt page has finished loading.
		firstPageLoading = false;

	} else {

		// If this is a secondary page that is loading, then only update the topBlock and not navBlock.
		document.getElementById("topBlock").outerHTML = xmlString(newNode.selectNodes("//*[@id='topBlock']")[0]);
	}

	// remove any remnants of newNode left over
	delete newNode;

	if (typeof(notesString) != "undefined" && document.getElementById("notesContent") != null) {
		document.getElementById("notesContent").value = notesString;
	}


	// reformat any elements that need specialized dhtml treatment (example: click tables).
	reformatPageElements(document.getElementById("contentBlock"));
	if (Number(document.documentElement.clientWidth) > 25)
	{
	    try{
	    document.getElementById("pageContent").style.width = Number(document.documentElement.clientWidth) - 25 + "px";
	    document.getElementById("pageContent").style.height = Number(document.documentElement.clientHeight) - 40 + "px";
	    }catch(e)
	    {
	        
	    }
	}

	//document.getElementById("pageContent").attachEvent("onresize", pageResize);
	window.attachEvent("onresize", pageResize);
}



// SIG // Begin signature block
// SIG // MIIbDAYJKoZIhvcNAQcCoIIa/TCCGvkCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFHR2MI1euTFe
// SIG // l/fc8rnU8asjbee9oIIV5zCCBIUwggNtoAMCAQICCmEI
// SIG // d18AAAAAAEowDQYJKoZIhvcNAQEFBQAweTELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEjMCEGA1UEAxMaTWljcm9zb2Z0IENv
// SIG // ZGUgU2lnbmluZyBQQ0EwHhcNMTAwNzE5MjI1MzEwWhcN
// SIG // MTExMDE5MjI1MzEwWjCBgzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjENMAsGA1UECxMETU9QUjEeMBwGA1UEAxMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMIIBIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAQ8AMIIBCgKCAQEAzH6Ae0H6i7RNmSlD3eb4Ut9b
// SIG // Qpe9Mxmc77Xa0MDc6PG3vlzhCrLCNaB+5PPUOKfyD0Jy
// SIG // p7qbzx8k3lYNhHPM02P3F82vaW9hTUyAT8h3HFFkyNME
// SIG // 8xQms7hCPzNDsNsmWViTtW2JYg8HVlvVEqCxCcwWK/mM
// SIG // 32FW6AZ4f9dziCYDZ9Gj/zSCrC1M2ALs7W+5ojHFMky7
// SIG // 9v1fYlte8fZkkceFd0cc9qcrRy0LN1RPth8EjbXsYCen
// SIG // 8362fKFMkaaLcdbGNWFHvMEVS92sMyK+BhmWS4oebgDr
// SIG // vh5p3VhZIQMrPL7mEwUXZjWnhi0a8dk0wAGAGvyaRp1u
// SIG // pOdI3DXqNwIDAQABo4IBAjCB/zATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDAzAdBgNVHQ4EFgQU5G9fyon5U77wcFcGUKrC
// SIG // eQ2sVpswDgYDVR0PAQH/BAQDAgeAMB8GA1UdIwQYMBaA
// SIG // FFdFdBxdsPbIQwXgjFQtjzKn/kiWMEkGA1UdHwRCMEAw
// SIG // PqA8oDqGOGh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9w
// SIG // a2kvY3JsL3Byb2R1Y3RzL0NvZGVTaWdQQ0EuY3JsME0G
// SIG // CCsGAQUFBwEBBEEwPzA9BggrBgEFBQcwAoYxaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9Db2Rl
// SIG // U2lnUENBLmNydDANBgkqhkiG9w0BAQUFAAOCAQEAlkFd
// SIG // PVwrpM64KkUvQgJeoZAcTHQnCc4LVH1wKEFyO6QVvNEE
// SIG // Ulevd3RtC1VXhzcQSR7W5tTCY5S0/aQuLfpf4hlZFYTZ
// SIG // t7bpUqJS3iNfIC9Z06sahH8d473qD98BiDkl2O1kYRkb
// SIG // eq+mFEpGUEjZckvVS5Ld8A+EfMvTxvJMeG79vP9mEAr3
// SIG // A10V6l6YDAnSmY8utSC9YebJbwUUEct7+0IIvQPxJldn
// SIG // TY9Zi7hEx0XTYgQMLTADWF7sSPRuqBQxBP00orgELQLd
// SIG // OqEJXq1hsY9wwHhVI2Oon1l3otu5G3EoHPwu4QSPte80
// SIG // vkqZR+NkUhY8+r3g6OAUDBAiNIKCHjCCBMowggOyoAMC
// SIG // AQICCmEEs/UAAAAAAA0wDQYJKoZIhvcNAQEFBQAwdzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBMB4XDTA4MDcyNTE5MTM0
// SIG // NVoXDTExMDcyNTE5MjM0NVowgbMxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsTHm5D
// SIG // aXBoZXIgRFNFIEVTTjo5RTc4LTg2NEItMDM5RDElMCMG
// SIG // A1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vydmlj
// SIG // ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
// SIG // AKtGL7yoFPL4Rj8MBaGkY0UFf5rpM3LMJ9My7JjD4DSI
// SIG // hc6hEpeuSFBOSCB/cORZM/yZW7kHgEgovI24+mYCZrXx
// SIG // fxxQliiTVY2BVapwW6XJzu8u4uclw3ZvKQufLMhTgJrB
// SIG // DeO9p0W/Md/mhot9iQGLHHhYOLLdk0pbnh3XnMbwxE3Q
// SIG // vydKB5QEcQKIDXDm+CrnDmHjmEvR3atUtjf7xkb9pBy8
// SIG // /6/sspeA3LiT/bgiqJ0lWXA+XHscQSn+c5kiSYHXVSbA
// SIG // 7PJOKFRiO3AtYZMdUNWfAcIFw1UaSoekAIZUoHtisuoP
// SIG // +l1cxSoRgpe+hhsdq7erCin8zM00ib9Atk8CAwEAAaOC
// SIG // ARkwggEVMB0GA1UdDgQWBBSghTFeh64PqgoE6+HA02S9
// SIG // PLtp9TAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7syuw
// SIG // wzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsGAQUF
// SIG // BwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRU
// SIG // aW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsGAQUF
// SIG // BwMIMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0BAQUF
// SIG // AAOCAQEAR3FPtkhFwAjrnC/TJVvbZ1ERkqbZ2bIUmibC
// SIG // /QbBzNeI9aY1tc0rtmtYas35nfNa60YvofqnH316QrKw
// SIG // 0RoJKFRsb5mLOPw65MEkqnJMEgQv8dR6djvFz3EnC238
// SIG // OGenxSJiK3t/wXasp8UmTKmvmN2KOF3PZaSBLqnvVgJM
// SIG // uQi+ZcQeiyEtbqfydWS03Bpr0PEl5cLngEQ51C8KeX4B
// SIG // Kqd4W6NrW84J7zk6ObfEZ1O5qvNh/515489IZ/+ryMYr
// SIG // YgmU0B+iePdzSTtYU8EJq0wGC9VAKH72sWbFv1LEvj47
// SIG // 4PmOdI3mIgzBxjOYtXnoDPcAfOqyTsyAmhYtyKQQBTCC
// SIG // BgcwggPvoAMCAQICCmEWaDQAAAAAABwwDQYJKoZIhvcN
// SIG // AQEFBQAwXzETMBEGCgmSJomT8ixkARkWA2NvbTEZMBcG
// SIG // CgmSJomT8ixkARkWCW1pY3Jvc29mdDEtMCsGA1UEAxMk
// SIG // TWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9y
// SIG // aXR5MB4XDTA3MDQwMzEyNTMwOVoXDTIxMDQwMzEzMDMw
// SIG // OVowdzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMY
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBMIIBIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn6Fssd/bSJIq
// SIG // fGsuGeG94uPFmVEjUK3O3RhOJA/u0afRTK10MCAR6wfV
// SIG // VJUVSZQbQpKumFwwJtoAa+h7veyJBw/3DgSY8InMH8sz
// SIG // JIed8vRnHCz8e+eIHernTqOhwSNTyo36Rc8J0F6v0LBC
// SIG // BKL5pmyTZ9co3EZTsIbQ5ShGLieshk9VUgzkAyz7apCQ
// SIG // MG6H81kwnfp+1pez6CGXfvjSE/MIt1NtUrRFkJ9IAEpH
// SIG // ZhEnKWaol+TTBoFKovmEpxFHFAmCn4TtVXj+AZodUAiF
// SIG // ABAwRu233iNGu8QtVJ+vHnhBMXfMm987g5OhYQK1HQ2x
// SIG // /PebsgHOIktU//kFw8IgCwIDAQABo4IBqzCCAacwDwYD
// SIG // VR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUIzT42VJGcArt
// SIG // QPt2+7MrsMM1sw8wCwYDVR0PBAQDAgGGMBAGCSsGAQQB
// SIG // gjcVAQQDAgEAMIGYBgNVHSMEgZAwgY2AFA6sgmBAVieX
// SIG // 5SUT/CrhClOVWeSkoWOkYTBfMRMwEQYKCZImiZPyLGQB
// SIG // GRYDY29tMRkwFwYKCZImiZPyLGQBGRYJbWljcm9zb2Z0
// SIG // MS0wKwYDVQQDEyRNaWNyb3NvZnQgUm9vdCBDZXJ0aWZp
// SIG // Y2F0ZSBBdXRob3JpdHmCEHmtFqFKoKWtTHNY9AcTLmUw
// SIG // UAYDVR0fBEkwRzBFoEOgQYY/aHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvbWljcm9z
// SIG // b2Z0cm9vdGNlcnQuY3JsMFQGCCsGAQUFBwEBBEgwRjBE
// SIG // BggrBgEFBQcwAoY4aHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNyb3NvZnRSb290Q2VydC5j
// SIG // cnQwEwYDVR0lBAwwCgYIKwYBBQUHAwgwDQYJKoZIhvcN
// SIG // AQEFBQADggIBABCXisNcA0Q23em0rXfbznlRTQGxLnRx
// SIG // W20ME6vOvnuPuC7UEqKMbWK4VwLLTiATUJndekDiV7uv
// SIG // WJoc4R0Bhqy7ePKL0Ow7Ae7ivo8KBciNSOLwUxXdT6uS
// SIG // 5OeNatWAweaU8gYvhQPpkSokInD79vzkeJkuDfcH4nC8
// SIG // GE6djmsKcpW4oTmcZy3FUQ7qYlw/FpiLID/iBxoy+cwx
// SIG // SnYxPStyC8jqcD3/hQoT38IKYY7w17gX606Lf8U1K16j
// SIG // v+u8fQtCe9RTciHuMMq7eGVcWwEXChQO0toUmPU8uWZY
// SIG // sy0v5/mFhsxRVuidcJRsrDlM1PZ5v6oYemIp76KbKTQG
// SIG // dxpiyT0ebR+C8AvHLLvPQ7Pl+ex9teOkqHQ1uE7FcSMS
// SIG // JnYLPFKMcVpGQxS8s7OwTWfIn0L/gHkhgJ4VMGboQhJe
// SIG // GsieIiHQQ+kr6bv0SMws1NgygEwmKkgkX1rqVu+m3pmd
// SIG // yjpvvYEndAYR7nYhv5uCwSdUtrFqPYmhdmG0bqETpr+q
// SIG // R/ASb/2KMmyy/t9RyIwjyWa9nR2HEmQCPS2vWY+45CHl
// SIG // tbDKY7R4VAXUQS5QrJSwpXirs6CWdRrZkocTdSIvMqgI
// SIG // bqBbjCW/oO+EyiHW6x5PyZruSeD3AWVviQt9yGnI5m7q
// SIG // p5fOMSn/DsVbXNhNG6HY+i+ePy5VFmvJE6P9MIIGgTCC
// SIG // BGmgAwIBAgIKYRUIJwAAAAAADDANBgkqhkiG9w0BAQUF
// SIG // ADBfMRMwEQYKCZImiZPyLGQBGRYDY29tMRkwFwYKCZIm
// SIG // iZPyLGQBGRYJbWljcm9zb2Z0MS0wKwYDVQQDEyRNaWNy
// SIG // b3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkw
// SIG // HhcNMDYwMTI1MjMyMjMyWhcNMTcwMTI1MjMzMjMyWjB5
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSMwIQYDVQQDExpNaWNy
// SIG // b3NvZnQgQ29kZSBTaWduaW5nIFBDQTCCASIwDQYJKoZI
// SIG // hvcNAQEBBQADggEPADCCAQoCggEBAJ+N34U3jLEGVmY2
// SIG // TtQK6zYjkR6vq41Y6cTPwZ86CiTExMResO4VFMX6Ppkz
// SIG // axlpcvR8BV/lmSVE1zUZipDcKI6QDO/VkGGt3twYcC2D
// SIG // yW+vhSz43bm5MP1xeByD/cipuYJnDXq4wQnCvBaXVz8c
// SIG // mNNp1zCQkJCNMB/YJtSee4jZ4gntl0lF6wRSgXV7uLUi
// SIG // uC5Wu9fPqU48CoOiqDrFrbYBDmrPIrQjH2zVJ+e3fsG0
// SIG // 1TKteSUcQobinYX0V9obWS8tJpIpxbPXhaOeYFqU5nuc
// SIG // e16CNEtt/9TuJ9Ci3NGQDM59DhV8iKw0x8BsmIRKyUR5
// SIG // aCjfIoMNuIosSGHi/hECAwEAAaOCAiMwggIfMBAGCSsG
// SIG // AQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRXRXQcXbD2yEMF
// SIG // 4IxULY8yp/5IljALBgNVHQ8EBAMCAcYwDwYDVR0TAQH/
// SIG // BAUwAwEB/zCBmAYDVR0jBIGQMIGNgBQOrIJgQFYnl+Ul
// SIG // E/wq4QpTlVnkpKFjpGEwXzETMBEGCgmSJomT8ixkARkW
// SIG // A2NvbTEZMBcGCgmSJomT8ixkARkWCW1pY3Jvc29mdDEt
// SIG // MCsGA1UEAxMkTWljcm9zb2Z0IFJvb3QgQ2VydGlmaWNh
// SIG // dGUgQXV0aG9yaXR5ghB5rRahSqClrUxzWPQHEy5lMFAG
// SIG // A1UdHwRJMEcwRaBDoEGGP2h0dHA6Ly9jcmwubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL21pY3Jvc29m
// SIG // dHJvb3RjZXJ0LmNybDBUBggrBgEFBQcBAQRIMEYwRAYI
// SIG // KwYBBQUHMAKGOGh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY2VydHMvTWljcm9zb2Z0Um9vdENlcnQuY3J0
// SIG // MHYGA1UdIARvMG0wawYJKwYBBAGCNxUvMF4wXAYIKwYB
// SIG // BQUHAgIwUB5OAEMAbwBwAHkAcgBpAGcAaAB0ACAAqQAg
// SIG // ADIAMAAwADYAIABNAGkAYwByAG8AcwBvAGYAdAAgAEMA
// SIG // bwByAHAAbwByAGEAdABpAG8AbgAuMBMGA1UdJQQMMAoG
// SIG // CCsGAQUFBwMDMA0GCSqGSIb3DQEBBQUAA4ICAQAwvLAg
// SIG // pGKgp+85JmE93KzGmdCGxC71gzJlXiI+m9aG+Oi2n8qL
// SIG // 1jt1C6GRPkzdZHSMSfKIjBhnbP4VZka4OkZCl8iRN9Qk
// SIG // sees0+pBFIN308lPBV+jFFK/lqQvPlZbEHXOU8POBVRp
// SIG // tGXJJKUP4SW4GrlN5QK5UB5Ps5gMHZUC7iJZrSLLBXQL
// SIG // BEV7BFng2A+z60z4YN3CeJ7Rup9r9/PufkQRQNK9uptL
// SIG // FghupL5V5KY4EqNI9BxVeoog0X3+kduUjy/Ce2umZIVP
// SIG // o+UsNCldC7/1xzgvxCDEVjH2ac6F+AqR7NDWrro4BQzr
// SIG // bk9MnAMpqqL8GKApDA1cXFYjV9oclg3IJjbBRMvl4eZv
// SIG // ieeP6Zi1c9N44+2jATx05V68bPYhiWcF7JedtbH9r6bp
// SIG // cqXDNOEvn/n0ajniLQSCW/zQnK58nRH55rVTGXS6OUo5
// SIG // 631Cs0o7Nz3CSnsnmOfiTpsbSlQ4aiM3vmq3SO7qQg1J
// SIG // JJGOtwQul2/k50W7j039YNnXWcLYgNZgNHu3oZMg/oG4
// SIG // qqVcCemKDb4oTX7X6A/tZXjRMV+5ZtvfQucLzAIHjd//
// SIG // IAajRWW0szKNLpHiTbSpyfq8awQOsp/qn96kyQqW9I33
// SIG // 2Jio8IUCCFmkIKYsCxryUgbtaeVkGBvgo6veynwUYUO4
// SIG // ZfU2o1UTK2csTRswTDGCBJEwggSNAgEBMIGHMHkxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xIzAhBgNVBAMTGk1pY3Jvc29m
// SIG // dCBDb2RlIFNpZ25pbmcgUENBAgphCHdfAAAAAABKMAkG
// SIG // BSsOAwIaBQCggb4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwIwYJKoZIhvcNAQkEMRYEFPF1rmHE5aGtALbSR/w/
// SIG // DVSAdfsUMF4GCisGAQQBgjcCAQwxUDBOoCaAJABNAGkA
// SIG // YwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4AZ6Ek
// SIG // gCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVhcm5p
// SIG // bmcgMA0GCSqGSIb3DQEBAQUABIIBAEOjy7vKu/zc6O+Y
// SIG // azVU+0Ybb6+3H5B8ZMaHMjeEj001/kJ4S0qmcPdHAMlm
// SIG // mwdz6lFQQ1wD+0mPa4BAeUuk+2oQ3bO0BWLFn/T+y0ot
// SIG // kwA8jehRYiWxJjfaFppMk0UiKKOtlAjFE/YoJD9svHDh
// SIG // l5qp9S4K67+F7KoNlSsqPm726mYlu28luyqhHKQeQwzO
// SIG // 7G+1dn3nln/GzNp1MpRmqOOhQ9oPWRUEVq6cheNKIy0I
// SIG // y+Xr72XUjKv2yID24NcOVgJnibdTkPzyIclOjVMoMvF9
// SIG // 7SZ7qqPogIVGnFkHnuMyHsNJOPW30RESsxfZqAVkqesV
// SIG // zJWZjqi+0XfieNSNusWhggIdMIICGQYJKoZIhvcNAQkG
// SIG // MYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBAgphBLP1AAAAAAANMAcGBSsOAwIaoF0wGAYJKoZI
// SIG // hvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUx
// SIG // DxcNMTAxMTEwMTc1MDU2WjAjBgkqhkiG9w0BCQQxFgQU
// SIG // pHEpsHtZ7mC2kZXklc3sv9STG08wDQYJKoZIhvcNAQEF
// SIG // BQAEggEAhrugljaIcpqQfGp4elffhgS8JJqID6Wm5Fj4
// SIG // D+xU6bgUeQMaBziRcR6Sg/LFv2Bg4refa0qnXAsU+iac
// SIG // LyYhSLEnVoA0eeecy7pn3Hur1eJHK/SVL39Gc27n0+gf
// SIG // c/uihdwvNsYWWQuQvDbC4O5YMLDyPYhefNhwwaHoQMAv
// SIG // JO/Czrb47eVFeBsVBdBcv4+ibeJan+v4/82V7wW5Uaje
// SIG // T6hASNJdaFLPHVq2tsfg1TKLnyTK0atOwWHR88dIKdYE
// SIG // nX4fNmEtq/oPBCAVFvIgPhESMMuMSUZmYz5bymfKsNet
// SIG // P8BSUE3lQbDciEOixhola3ZdKh9mjvJFl8kLVKKtfg==
// SIG // End signature block
