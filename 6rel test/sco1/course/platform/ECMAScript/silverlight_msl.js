var slXmlDom = null;
var slGlobalStringXmlDom = null;
var sltemplateType = null;
var slHostBaseUri = null;
var slPrevObject = null;
var ctaMediaElements = null;
var ctaFileElements = null;

if (!window.Silverlight.Controls)
	window.Silverlight.Controls = {};

Silverlight.createDelegate = function(instance, method) {
	return function() {
		return method.apply(instance, arguments);
	}
}

Silverlight.followFWLink = function(a)
{
    var getSilverlightLink = Silverlight.fwlinkRoot + a;
    window.open(getSilverlightLink);
}

function createSilverlight(projectName)
{
	var xamlUri = "platform/interactive/definitions/" + projectName.toLowerCase() + ".xaml";
	var controlId = projectName + "Control";
	var parentId = projectName + "ControlHost";

	var scene = new window[projectName].Page();
	var html = Silverlight.createObjectEx({
		source: xamlUri,
		parentElement: document.getElementById(parentId),
		id: controlId,
		properties: {
			width: "100%",
			height: "100%",
			isWindowless: window.ActiveXObject?'true':'false',
			version: "1.0"
		},
		events: {
			onLoad: Silverlight.createDelegate(scene, scene.handleLoad)
		}
	});

	// add the parent div to the control html
	html = "<div id=\"" + parentId + "\" class=\"" + projectName + "\">" + html + "</div>";

	return html;
}

function createSilverlightXAP(projectName) {
    var xapUri = "platform/interactive/definitions/" + projectName.toLowerCase() + ".xap";
    var controlId = projectName + "Control";
    var parentId = projectName + "ControlHost";
    var html = Silverlight.createObjectEx({
        source: xapUri,
        parentElement: document.getElementById(parentId),
        id: controlId,
        properties: {
            width: "100%",
            height: "100%",
            isWindowless: 'false',
            version: "1.0"
        }
       
    });

    // add the parent div to the control html
    html = "<div id=\"" + parentId + "\" class=\"" + projectName + "\">" + html + "</div>";

    return html;
}

function createSilverlightMediaPlayer( mediaPlayerUri, mediaUri, rowCount)
{
    var controlId;var parentId;
        // If more than one media uploaded (clickTableAnimation).
    if(rowCount > 1 )
    {
        controlId = "mediaPlayer" + "Control_" + rowCount;
	    parentId = "mediaPlayer" + "ControlHost_" + rowCount;
    }
    else{controlId = "mediaPlayer" + "Control";parentId = "mediaPlayer" + "ControlHost";}

	var projectName = "mediaplayer";

	//var scene = new window[projectName].Page();
	var html = Silverlight.createObjectEx({
		source: mediaPlayerUri,
		parentElement: document.getElementById(parentId),
		id: controlId,
		properties: {
			width: "100%",
			height: "100%",
			isWindowless: 'false',
			version: "1.0"
		}
//		events: {
//			onLoad: Silverlight.createDelegate(scene, scene.handleLoad)
//		}
	});

	// add the parent div to the control html
	html = "<div id=\"" + parentId + "\" class=\"" + "wmvMedia" + "\" name=\"mediaPlayerControl\">" + html + "</div>";

	return html;
}

// If one of the activities supplied exists within the content xml, then create a silverlight xml string
//  that you inject into the transform.  The transform then uses this node tree in place of flash if
//  Silverlight is installed.
function injectSilverLightActivityIntoTransform(contentXmlDom, xslDom, basePlatformUri) {
	// Ensure that the basePlatformUri is properly set to the folder containing the platform folder of interest.
	basePlatformUri = generateBasePlatformUri( basePlatformUri );
    var silverLightActivities = new Array();

	var minVersion = gSettings.silverlight_minimumVersion;
	if ( Silverlight.isInstalled(minVersion) || gSettings.silverlight_required == "true") {

		// Set the silverLightInstalled variable to true so that the transform uses the Silverlight object.
		var silverLightVar = xslDom.selectSingleNode("//*[name()='xsl:variable'][@name='silverLightInstalled']");
		if (silverLightVar != null) { // If there is a silverLightInstalled variable in the transform.
			silverLightVar.firstChild.nodeValue = "true";

			//silverLightActivities = silverLightActivities.split(',');

			if ( gSettings.silverlight_captionMediaSupported == "true" )
				silverLightActivities.push( "captionMedia" );
			if ( gSettings.silverlight_sortGameSupported == "true" )
				silverLightActivities.push( "sortGame" );
			if ( gSettings.silverlight_dragAndDropSupported == "true" )
				silverLightActivities.push( "dragAndDrop" );
			if ( gSettings.silverlight_adventureSupported == "true" )
				silverLightActivities.push( "adventure" );
			if ( gSettings.silverlight_tileFlipSupported == "true" )
				silverLightActivities.push( "tileFlip" );
				
	    }
	}
		
    silverLightActivities.push( "media" );
	silverLightActivities.push( "interactiveJobAid" );
	silverLightActivities.push( "slider" );
	silverLightActivities.push("sequence");
	silverLightActivities.push("flashCard");
	
	// For each of the activities in the silverLightActivities array.
	for ( var i = 0; i < silverLightActivities.length; i++ ) {
		var activityName = silverLightActivities[i];
		// Check to see if the activity is in the content xml.
		var xpathString = "//*[name()='activity'][@type='" + activityName + "']";

		if ( contentXmlDom.selectSingleNode( xpathString ) != null) {

		    if (activityName == "adventure" || activityName == "captionMedia" || activityName == "sortGame" || activityName == "tileFlip" || activityName == "dragAndDrop" || activityName == "sequence" || activityName == "flashCard" || activityName == "interactiveJobAid" || activityName == "media" || activityName == "slider") 
            {
                //var activityXapFileUri = basePlatformUri + "platform/interactive/definitions/" + activityName.toLowerCase() + ".xap";
                var activityControlId = activityName + "ControlHost";
                var existingSilverlightControl = document.getElementById(activityControlId);
                if (existingSilverlightControl)
                    existingSilverlightControl.setAttribute("id", "#");
                // Create the corresponding Silverlight js object and retrieve the corresponding html.

                var activityHTML = createSilverlightXAP(activityName);
               

			    var xslVariableName = activityName + "SilverLightNodeTree";
			    // Find the corresponding xsl variable in the transform that we use to inject the
			    //  silverlight html into.
			    var xslVariableXpathString = "//*[name()='xsl:variable'][@name='" + xslVariableName + "']";
			    var silverLightVar = xslDom.selectSingleNode(xslVariableXpathString);
			    if (silverLightVar != null) {
			        // Turn the silverlight html string into an xml node tree and put it into the xsl variable.
			        var activityNodeTree = new XmlDom();
			        activityNodeTree.loadXML(activityHTML);
			        silverLightVar.appendChild(activityNodeTree.documentElement);
			        //alert('Append Child');
			    }

		    }
		    else
            {
			// Ensure that the activity is installed.
			// Important! - This will cause a performance penalty (the activity xaml needs to be successfully loaded)
			var activityXamlFileUri = basePlatformUri + "platform/interactive/definitions/" + activityName.toLowerCase() + ".xaml";
			var activityXamlDom = new XmlDom();
			var activityXamlLoadSuccess = activityXamlDom.load(activityXamlFileUri);
			if (activityXamlLoadSuccess == true) {

				// Load the activity's js file.
				var javascriptFileUri = basePlatformUri + "platform/interactive/definitions/" + activityName.toLowerCase() + ".js";
				importJavascript(javascriptFileUri);

				// Change the ids of any elements with the corresponding "ControlHost" id (or else Silverlight.js will innerHTML them).
				var activityControlId = activityName + "ControlHost";
				var existingSilverlightControl = document.getElementById(activityControlId);
				if (existingSilverlightControl)
					existingSilverlightControl.setAttribute("id", "#");

				// Create the corresponding Silverlight js object and retrieve the corresponding html.
				var activityHTML = createSilverlight( activityName );
				var xslVariableName = activityName + "SilverLightNodeTree";
				// Find the corresponding xsl variable in the transform that we use to inject the
				//  silverlight html into.
				var xslVariableXpathString = "//*[name()='xsl:variable'][@name='" + xslVariableName + "']";
				var silverLightVar = xslDom.selectSingleNode( xslVariableXpathString );
				if (silverLightVar != null) {
					// Turn the silverlight html string into an xml node tree and put it into the xsl variable.
					var activityNodeTree = new XmlDom();
					activityNodeTree.loadXML(activityHTML);
					silverLightVar.appendChild(activityNodeTree.documentElement);
			    }
				}
			}
		}
	}
}


// If the content page requires a media player, inject the silverlight Media Player node tree into the SCO transform.
function injectSilverLightMediaPlayerIntoTransform( contentXmlDom, xslDom, basePlatformUri, rowCount ) {

	var activityHTML = generateSilverLightMediaPlayerHtml( contentXmlDom, basePlatformUri, rowCount );
	var xslVariableXpathString;

	if ( activityHTML != null ) {

		// Find the corresponding xsl variable in the transform that we use to inject the
		//  silverlight html into.
		if(rowCount > 1){
            xslVariableXpathString = "//*[name()='xsl:variable'][@name='mediaPlayerSilverLightNodeTree_" + rowCount + "']";
        }else{xslVariableXpathString = "//*[name()='xsl:variable'][@name='mediaPlayerSilverLightNodeTree']";}
		var silverLightVar = xslDom.selectSingleNode( xslVariableXpathString );
		if (silverLightVar != null) {
			// Turn the silverlight html string into an xml node tree and put it into the xsl variable.
			var activityNodeTree = new XmlDom();
			activityNodeTree.loadXML(activityHTML);
			silverLightVar.appendChild(activityNodeTree.documentElement);
		}
	}
}


// If the content page requires a media player, inject the silverlight Media Player node tree into the SCO transform.
function generateSilverLightMediaPlayerHtml( contentXmlDom, basePlatformUri,rowCount) {

	// Ensure that the basePlatformUri is properly set to the folder containing the platform folder of interest.
	basePlatformUri = generateBasePlatformUri( basePlatformUri );

	// If we are on a popped up page, ensure that gStrings is defined.
	if ( typeof gStrings == "undefined" )
	{
		if ( opener != null && typeof opener.gStrings != "undefined" )
			gStrings = opener.gStrings;
		if ( typeof window.dialogArguments !=  "undefined")	
		    gStrings = window.dialogArguments["strings"];
	}

	var mediaUriLowerCase = "translate(@uri, " + gStrings.upperCaseUnicodeCharacters + ", " + gStrings.lowerCaseUnicodeCharacters + ")";
	var xmlUri = "substring(" + mediaUriLowerCase + ", (string-length(" + mediaUriLowerCase + ") - string-length('.xml')) + 1) = '.xml'";
	var wmvUri = "substring(" + mediaUriLowerCase + ", (string-length(" + mediaUriLowerCase + ") - string-length('.wmv')) + 1) = '.wmv'";

	// Check to see if the xaml content is in the content xml.
	var xPathString = "//*[name()='media'][" + wmvUri + "]";
	var xPathXMLString = "//*[name()='file'][" + xmlUri + "]";

	// If any media elements have xaml or wmv URIs.
	var mediaElement = contentXmlDom.selectSingleNode( xPathString );

	//CTA Media Elements used for passing into XAP.
	
	if (ctaMediaElements == null)
	    ctaMediaElements = contentXmlDom.selectNodes(xPathString);

	if (ctaFileElements == null)
	    ctaFileElements = contentXmlDom.selectNodes(xPathXMLString);

	if ( mediaElement != null ) {

		var mediaPlayerUri = basePlatformUri + "platform/interactive/definitions/mediaplayer.xap";

		// Load the mediaPlayer js file.
// 		var mediaPlayerJavascriptFileUri = basePlatformUri + "platform/interactive/definitions/mediaplayer.js";
// 		importJavascript( mediaPlayerJavascriptFileUri );

        var activityControlId;
		// Change the ids of any elements with the corresponding "ControlHost" id (or else Silverlight.js will innerHTML them).
		if (rowCount > 1 )
	    {	
	        // If more than one media uploaded (clickTableAnimation).
	        activityControlId = "mediaPlayer" + "ControlHost" + "_" + rowCount;
	    }
	    else{activityControlId = "mediaPlayer" + "ControlHost";}
	
		var existingSilverlightControl = document.getElementById(activityControlId);
		if (existingSilverlightControl)
			existingSilverlightControl.setAttribute("id", "#");


		// Create the corresponding Silverlight js object and retrieve the corresponding html.
		var activityHTML = createSilverlightMediaPlayer( mediaPlayerUri,undefined,rowCount);

		return activityHTML;
	}
	return null;
}

function loadSilverlightMediaPlayer(controlId) 
{
    try {
        var projectname = "";
        pluginObject = document.getElementById(controlId);
        var ccXMLNode = null;
        var ccXMLDOM = XmlDom();
        var ccXMLPath = null;
        var mediaPath = null;
        var mediaNodes = null;

        if (sltemplateType != null && sltemplateType == "demo000") {

            ccXMLNode = slXmlDom.getElementsByTagName("file");
            if (ccXMLNode.length > 0) {
                ccXMLPath = slHostBaseUri + ccXMLNode[0].attributes[0].value;
                if(ccXMLNode[0].attributes[0].value !="")
                    ccXMLDOM.load(ccXMLPath);
            }
            pluginObject.Content.SLScriptableObject.GstringsXML = slGlobalStringXmlDom.documentElement.xml;
            pluginObject.Content.SLScriptableObject.TemplateType = sltemplateType;
            mediaNodes = slXmlDom.getElementsByTagName("media");
            mediaPath = slHostBaseUri + mediaNodes[1].attributes[0].value;
            pluginObject.Content.SLScriptableObject.MediaPath = mediaPath;
            //send cc xml also
            if (ccXMLDOM.xml != "")
                pluginObject.Content.SLScriptableObject.CCXml = ccXMLDOM.documentElement.xml;
        }
        else {
            if (templateType == "animation000" || templateType == "media000") {

                pluginObject.Content.SLScriptableObject.GstringsXML = globalStrings.documentElement.xml;
                pluginObject.Content.SLScriptableObject.TemplateType = templateType;
                mediaNodes = xmlFileDom.getElementsByTagName("media");
                ccXMLNode = xmlFileDom.getElementsByTagName("file");
                if (ccXMLNode.length > 0) {
                    ccXMLPath = generateBasePlatformUri() + ccXMLNode[0].attributes[0].value;
                    if(ccXMLNode[0].attributes[0].value != "")
                        ccXMLDOM.load(ccXMLPath);
                }
                
                mediaPath = generateBasePlatformUri() + mediaNodes[0].attributes[0].value;
                pluginObject.Content.SLScriptableObject.GameXML = xmlFileDom.documentElement.xml;
                pluginObject.Content.SLScriptableObject.MediaPath = mediaPath;
                if (ccXMLDOM.xml != "")
                    pluginObject.Content.SLScriptableObject.CCXml = ccXMLDOM.documentElement.xml;
            }

            if (templateType == "clickTableAnimation000") {
              
                    mediaNodes = xmlFileDom.getElementsByTagName("media");
                    var fileNodes = xmlFileDom.getElementsByTagName("file");
                    var charIndex = controlId.indexOf('_');
                    if (charIndex != -1) {
                        var controlPos = controlId.substring(charIndex + 1);
                        for (var currentMedia = 0; currentMedia < ctaMediaElements.length; currentMedia++) {
                            if (ctaMediaElements[currentMedia].parentNode.getAttribute("title").slice(-1) == controlPos) {
                                mediaPath = generateBasePlatformUri() + ctaMediaElements[currentMedia].attributes[0].value;
                                break;
                            }
                        }
                        for (var currentFile = 0; currentFile < ctaFileElements.length; currentFile++) {
                            if (ctaFileElements[currentFile].parentNode.getAttribute("title").slice(-1) == controlPos) {
                                ccXMLPath = generateBasePlatformUri() + ctaFileElements[currentFile].attributes[0].value;
                                ccXMLDOM.load(ccXMLPath);
                                break;
                            }
                        }
                    }
                    else {
                        mediaPath = generateBasePlatformUri() + ctaMediaElements[0].attributes[0].value;
                        if (ctaFileElements.length != 0) {
                            ccXMLPath = generateBasePlatformUri() + ctaFileElements[0].attributes[0].value;
                            if(ctaFileElements[0].attributes[0].value !="")
                                ccXMLDOM.load(ccXMLPath);
                        }

                    }
                    //mediaPath = generateBasePlatformUri() + "media/Butterfly.wmv";
                    //To Stop Playing the other media elements and Play only the current.

                    var objectNodes = document.getElementsByTagName("Object");
                    var rowCount = getRowCount();
                    for (var i = 0; i < objectNodes.length; i++) {
                        if (objectNodes[i].parentElement.className == "wmvMedia" && rowCount == i) {
                            try {
                                if (pluginObject == null)
                                    pluginObject = objectNodes[i];
                            pluginObject.Content.SLScriptableObject.PlayMedia = true;
                            }catch(e){
                                objectNodes[i].Content.SLScriptableObject.PlayMedia = true;
                            }
                        } else {
                        try {
                            if (window.ActiveXObject)
                                objectNodes[i].Content.SLScriptableObject.PlayMedia = false;
                            else
                                pluginObject.Content.SLScriptableObject.PlayMedia = false;
                        } catch (e) { }
                        }
                    }
                    pluginObject.Content.SLScriptableObject.RowCount = rowCount;
                    pluginObject.Content.SLScriptableObject.GameXML = xmlFileDom.documentElement.xml;
                    pluginObject.Content.SLScriptableObject.GstringsXML = globalStrings.documentElement.xml;
                    pluginObject.Content.SLScriptableObject.TemplateType = templateType;
                    pluginObject.Content.SLScriptableObject.MediaPath = mediaPath;
                    if (!window.ActiveXObject)
                    pluginObject.Content.SLScriptableObject.PlayMedia = true;
                    if (ccXMLDOM.xml != "")
                        pluginObject.Content.SLScriptableObject.CCXml = ccXMLDOM.documentElement.xml;
                  
            }
        }
    }
    catch (e) { }
}


//Called from the Silverlight Game 
function loadSilverlight()
 {
    
    var projectname = "";
        switch (templateType)
         {
            case "adventure000":
                projectname = "adventure";
                break;
            case "sortGame000":
                projectname = "sortGame";
                break;
            case "tileFlip000":
                projectname = "tileFlip";
                break;
           case "introduction000":
             projectname = "captionMedia";
             break;
         case "interactiveJobAid000":
             projectname = "interactiveJobAid";
             break;
         case "slider000":
             projectname = "slider";
             break;
         case "dragAndDrop000":
             projectname = "dragAndDrop";
             break;
         case "sequence000":
             projectname = "sequence";
             break;
         case "flashCard000":
             projectname = "flashCard";
             break;
            default: break;
        }

    var controlId = projectname + "Control";
    pluginObject = document.getElementById(controlId);
    pluginObject.Content.SLScriptableObject.CoursePath = generateBasePlatformUri();
    pluginObject.Content.SLScriptableObject.GameXML = xmlFileDom.documentElement.xml;
    pluginObject.Content.SLScriptableObject.GstringsXML = globalStrings.documentElement.xml;
}


function SetSilverlightVariables(xmlFileDom,globalStringXMLDom,templateType,baseUri) {

    slXmlDom = xmlFileDom;
    slGlobalStringXmlDom = globalStringXMLDom;
    sltemplateType = templateType;
    slHostBaseUri = baseUri;


}
// SIG // Begin signature block
// SIG // MIIbDAYJKoZIhvcNAQcCoIIa/TCCGvkCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFN5t4ogZnPCq
// SIG // s9wOzdVBCPzCMaYGoIIV5zCCBIUwggNtoAMCAQICCmEI
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
// SIG // ARUwIwYJKoZIhvcNAQkEMRYEFMs4V0j9wuxA5EoUTfQg
// SIG // S9MQg7jjMF4GCisGAQQBgjcCAQwxUDBOoCaAJABNAGkA
// SIG // YwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4AZ6Ek
// SIG // gCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVhcm5p
// SIG // bmcgMA0GCSqGSIb3DQEBAQUABIIBAMlpG30n7XZFjrD4
// SIG // AtnA7nci6jy1uv2MMhE7fL8JGcjT8n6PzsS2pTFc5bgz
// SIG // EsaqVnGg3+9rhAt8LxbafYO9mWc4DNJYRJcXEpQzf1od
// SIG // Tkyij2R92ct3XKP49RAYSqh40kABW00DSNd8u6f2PgpH
// SIG // JTIuZTvgxR5pGOkqD+i9XWD1xMeeg0Fb0autEWuKq1ax
// SIG // lM2O4H+cV6OZ6PupZ1h1yH5Wf2m91qGRoyngSteJLULS
// SIG // MmkzBG7B9AWuX5BDW54jgEVUG4ldsYPacIyt+uM8wewi
// SIG // HEhcKw2+VkZwrT0id4wJK7KQo2tDa5EKV3H0HLk/kzKi
// SIG // Jg5F0r0asmFZX8bvgg2hggIdMIICGQYJKoZIhvcNAQkG
// SIG // MYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBAgphBLP1AAAAAAANMAcGBSsOAwIaoF0wGAYJKoZI
// SIG // hvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUx
// SIG // DxcNMTEwMjA3MTc1NTE0WjAjBgkqhkiG9w0BCQQxFgQU
// SIG // 2gKAfVw12Sft6aErvpRPTKjyB4swDQYJKoZIhvcNAQEF
// SIG // BQAEggEAaZXzz4DF2+PV/oIuQAdUjvnx6BKpXjvecFlT
// SIG // t25BnmkEZwB09ANkxal44bGsaju2I8+sf/Gw6WZSoNOL
// SIG // uun3qCcQxOLJg1LCMObvutpnCAwaex5dqlDI1j/XNppN
// SIG // G0BjrxylX31qLrlnSAZO0aXgXmZ/TmEY0rsUayIoNwha
// SIG // HcgX4CKc66ySoYHq8cG/J1tygDtdgaLjDQ7UXv9NoghI
// SIG // J1fECWuvBi9wsgS3W5lasJbRvVCMX6dnf0uiEzGRK3Im
// SIG // eQr1KA+suiWvLTDT/eCL+WvzPTE1z+KDou/aHOvzBQX/
// SIG // y7Yrh3finIvUjxfqWgxAtDls/7qJveqgRDQIov4Ahw==
// SIG // End signature block
