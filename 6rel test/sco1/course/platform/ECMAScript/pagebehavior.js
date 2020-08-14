//	Copyright 2006 Microsoft Corporation.  All Rights Reserved.

// Grab the localization strings for the current content's language and inject them into the global
//	gStrings associative array object.
var clickTableFirstRowContent = null;
var clickTableShowRowContent = false;
var isClicked = null;
var rowCount = null;
function setCurrentGlobalStrings(contentPageUri, basePlatformUri) {
	// Ensure that the basePlatformUri is properly set to the folder containing the platform folder of interest.
	basePlatformUri = generateBasePlatformUri( basePlatformUri );

	// Isolate the current content's language.
	var contentLanguage = getContentLanguage(basePlatformUri+ contentPageUri + ".xml" );
	currentPageLanguage = contentLanguage;

	// Load the content strings of the specified language.
	 globalStringsUri = basePlatformUri + "platform/localization/" + contentLanguage + ".xml";
	globalStrings = new XmlDom();
	globalStrings.load( globalStringsUri );
	var globalVariables = globalStrings.selectNodes("//variable");

	// Create a global associative array and pack it with the variables defined in the global strings xml file.
	gStrings = new Object();
	for (var i = 0; i < globalVariables.length; i++) {
		var currentNode = globalVariables[i];
		//
		gStrings[ currentNode.getAttributeNode( "name" ).value ] = currentNode.firstChild.nodeValue;
	}
}
function setCurrentGlobalSettings( basePlatformUri ) {
	// Ensure that the basePlatformUri is properly set to the folder containing the platform folder of interest.
	basePlatformUri = generateBasePlatformUri( basePlatformUri );

	// Load the content strings of the specified language.
	var globalSettingsUri = basePlatformUri + "platform/settings/settings.xml";
	var globalSettings = new XmlDom();
	globalSettings.load( globalSettingsUri );
	var globalSettings = globalSettings.selectNodes( "//variable" );

	// Create a global associative array and pack it with the content settings defined in the global settings xml file.
	gSettings = new Object();
	for (var i = 0; i < globalSettings.length; i++) {
		var currentNode = globalSettings[i];
		//
		gSettings[ currentNode.getAttributeNode( "name" ).value ] = currentNode.firstChild.nodeValue;
	}
}

// Define the directory that the platform is found within by using the currently loaded html page's location
function generateBasePlatformUri( basePlatformUri ) {
	// Ensure that the basePlatformUri is properly set to the folder containing the platform folder of interest.
	if ( typeof basePlatformUri == "undefined" ) {
		var loadingPageUri = String( document.location );
		var lastSlash = loadingPageUri.lastIndexOf( '/' );
		var basePlatformUri = loadingPageUri.slice( 0, lastSlash + 1 );
	} else {
		if ( basePlatformUri[ basePlatformUri.length ] != '/' )
			basePlatformUri += '/';
	}
	return basePlatformUri;
}

// allows persistant window modification
var newWindow;
function popUpWindow(url, w, h, windowName, scrollBars) {
	if (typeof newWindow != 'undefined') {	// if a window has been opened
		newWindow.close();	// known error - window is not closing... can't determine reason
	}
	windowConfig = "width=" + w + ", height=" + h +
		", left=0, top=0, toolbar=no, menubar=no, scrollable=" + scrollBars +
		", resizable=no, location=no, directories=no, status=no";
	newWindow = window.open(url, windowName, windowConfig);
	newWindow.focus();
	dynamicWindows.push(newWindow);
}

var dialogArgs = null;

var dynamicWindows = new Array();
function dynamicMediaWindow(w, h, lang, title, mediaUri, mediaType, parentXmlUri, transcriptXpath) {
	// Load the transcript text.
	var parentXml = new XmlDom();
	var success = parentXml.load(parentXmlUri);
	if (success == true) {

		// Isolate the transcript content.
		if (msXmlVersion == "MSXML2.DOMDocument.3.0") {	// If the content dom is an MSXML3 dom.
			// If the transcriptXpath ends in a closing bracket, it is effected by the bug.
			if (transcriptXpath.slice(transcriptXpath.length - 1, transcriptXpath.length) == "]") {
				// This code assumes that the transcriptXpath will only have a single open/close bracket pair.
				var openingBracket = transcriptXpath.indexOf("[");
				var closingBracket = transcriptXpath.indexOf("]");
				var modifiedTranscriptXpath = transcriptXpath.slice(0, openingBracket);
				var nodePosition = Number(transcriptXpath.slice(openingBracket + 1, closingBracket)) - 1;
				var transcriptXmlContent = parentXml.selectNodes(modifiedTranscriptXpath)[nodePosition];
			} else {
				var transcriptXmlContent = parentXml.selectNodes(transcriptXpath)[0];
			}
		} else {
			var transcriptXmlContent = parentXml.selectNodes(transcriptXpath)[0];
		}

		var xslFileDom = new XmlDom();
		xslFileDom.load("platform/transforms/presentation.xsl");

		var transcriptHtmlContentString = transcriptXmlContent.transformNode(xslFileDom);
		var transcriptHtml = new XmlDom();
		transcriptHtml.loadXML(transcriptHtmlContentString);

		var transcriptHtmlString = new String();
//		if (transcriptHtml.documentElement.childNodes.length > 0) {
//			transcriptHtmlString = '<div class="transcript"><h3>' + gStrings['mediaPopUp_transcriptHeading'] + '</h3><div class="transcriptText">' + transcriptHtml.documentElement.xml + '</div></div>';
			// Increase the width to accomodate the transcript pane.
//			w += 200;
//		}

        var basePlatformUri = generateBasePlatformUri( basePlatformUri );
		var newWindowUri = "platform/interactive/host.htm";
		
		//IE6 takes dialog size, not content frame size
		if (window.navigator.appVersion.indexOf("MSIE 6.0") != -1)
		{
		    h = h + 35;
		    w = w + 6;
		}
		
        windowConfig = "dialogWidth:" + w + "px; dialogHeight:" + h 
                +"px; dialogLeft:0; dialogTop:0; toolbar:no; menubar:no; scroll:no" 
                +"; resizable:no; location:no; directories:no; status:no; help:no; maximize:no; minimize:yes";

        windowMedia = "width=" + w + "px, height=" + h
                + "px, left=0, top=0, toolbar=no, menubar=no, scrollbars=no"
                + ", resizable=no, location=no, directories=no, status=no, help=no, maximize=no, minimize=yes";

		dialogArgs = new Array;
		dialogArgs["title"]=title;

		var styleUri = "platform/styles/presentation.css";

		var contentExtension = mediaUri.slice( -4 );
		if ( contentExtension == ".swf" ) {
		    dialogArgs["type"]="swf";
		    //var newWindow = window.showModelessDialog(newWindowUri, dialogArgs, windowConfig);
		    //var newWindow = window.open(newWindowUri,'', 'width=800px,height=600px');
		    if (window.parent.name != "")
		        var newWindow = window.open(newWindowUri, 'host', windowMedia, false);
		    else
		    //for 64 bit Windows 7 preview mode
		        var newWindow = window.showModelessDialog(newWindowUri, dialogArgs, windowConfig);

			var objectString = '<object class=\"' + mediaType + '\"';
			objectString += ' data=\"' + mediaUri + '\"';
			if(window.ActiveXObject)
			    objectString += ' classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\"';
			objectString += '><param name=\"movie\" value=\"' + mediaUri + '\"/><param name=\"quality\" value=\"high\"/><param name=\"play\" value=\"true\"/><param name=\"loop\" value=\"true\"/><param name=\"menu\" value=\"true\"/><param name=\"bgcolor\" value=\"#ffffff\"/><param name=\"allowScriptAccess\" value=\"sameDomain\"/><param name=\"FlashVars\" value=\"&contentLanguage=' + lang + '\" /></object>';
			var pageHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><meta http-equiv="content-type" content="application/xhtml+xml;charset=UTF-8" /><link type="text/css" media="screen" rel="stylesheet" href="' + styleUri + '" /><title>' + title + '</title></head><body class="dynamicWindow"><div id="' + mediaType + 'Launch' + '" class="pageContent">' + objectString + transcriptHtmlString + '</div></body></html>';
            newWindow.document.write(pageHTML);
			
			//dialogArgs["globalStringsxmlDom"] = pageHTML;
			if (!window.ActiveXObject)
			    newWindow.document.close();

		} else if ( contentExtension == ".wmv" ) {
		    dialogArgs["type"]="wmv";
		    dialogArgs["xmlDom"]=loadedPageXmlDom;
            dialogArgs["strings"]=gStrings;
            dialogArgs["baseUri"] = basePlatformUri;
            dialogArgs["globalStringsxmlDom"] = globalStrings;
            dialogArgs["templateType"] = templateType;
            if(window.parent.name!="")
                var newWindow = window.open(newWindowUri, 'host',windowMedia, false);
            else
                //for 64 bit Windows 7 preview mode
                var newWindow = window.showModelessDialog(newWindowUri, dialogArgs, windowConfig);
		}


		// If the media type is WMV or XAML, create a silverlight object string.
//		var silverlightMediaPlayerHtml = generateSilverLightMediaPlayerHtml( loadedPageXmlDom );
//		if ( silverlightMediaPlayerHtml != null ) {

//			var pageHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><meta http-equiv="content-type" content="application/xhtml+xml;charset=UTF-8" /><script type="text/javascript" scr="platform/ECMAScript/xmldom.js"></script><script type="text/javascript" scr="platform/ECMAScript/pageBehavior.js"></script><script type="text/javascript" src="platform/ECMAScript/Silverlight.js"></script><script type="text/javascript" src="platform/ECMAScript/Silverlight_MSL.js"></script><script type="text/javascript" src="platform/interactive/definitions/mediaPlayer.js"></script><link type="text/css" media="screen" rel="stylesheet" href="' + styleUri + '" /><title>' + title + '</title></head><body class="dynamicWindow"><div id="' + mediaType + 'Launch' + '" class="pageContent">' + '<script type="text/javascript">document.write( generateSilverLightMediaPlayerHtml( opener.loadedPageXmlDom ) );</script>' + transcriptHtmlString + '</div></body></html>';

		//<script type="text/javascript" src="platform/ECMAScript/xmldom.js"></script><script type="text/javascript" src="platform/ECMAScript/flashPageCommunication.js"></script>
		//<script type="text/javascript">writeActiveContent(\'' + objectString + '\');</script>

//  codebase="https://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0"

        //if(window.ActiveXObject)
		    //newWindow.location.reload(false);	// This solves a weird print problem - the page is still waiting for write input.
//		newWindow.focus();
		dynamicWindows.push(newWindow);
	}
}
// Dynamically create a new window and insert the content page's transcript to print.
function transcriptDynamicPrint(w, h, lang, parentXmlUri, transcriptXpath, windowTitle, lessonTitle, topicTitle) {
	// Load the transcript text.
	var parentXml = new XmlDom();
	var success = parentXml.load(parentXmlUri);
	if (success == true) {

		// Isolate the transcript content.
		if (msXmlVersion == "MSXML2.DOMDocument.3.0") {	// If the content dom is an MSXML3 dom.
			// If the transcriptXpath ends in a closing bracket, it is effected by the bug.
			if (transcriptXpath.slice(transcriptXpath.length - 1, transcriptXpath.length) == "]") {
				// This code assumes that the transcriptXpath will only have a single open/close bracket pair.
				var openingBracket = transcriptXpath.indexOf("[");
				var closingBracket = transcriptXpath.indexOf("]");
				var modifiedTranscriptXpath = transcriptXpath.slice(0, openingBracket);
				var nodePosition = Number(transcriptXpath.slice(openingBracket + 1, closingBracket)) - 1;
				var transcriptXmlContent = parentXml.selectNodes(modifiedTranscriptXpath)[nodePosition];
			} else {
				var transcriptXmlContent = parentXml.selectNodes(transcriptXpath)[0];
			}
		} else {
			var transcriptXmlContent = parentXml.selectNodes(transcriptXpath)[0];
		}



		var xslFileDom = new XmlDom();
		xslFileDom.load("platform/transforms/presentation.xsl");

		var transcriptHtmlContentString = transcriptXmlContent.transformNode(xslFileDom);
		var transcriptHtml = new XmlDom();
		transcriptHtml.loadXML(transcriptHtmlContentString);

		var newWindowUri = "platform/interactive/host.htm";
        windowConfig = "dialogWidth:" + w + "px; dialogHeight:" + h 
                +"px; dialogLeft:0; dialogTop:0; toolbar:no; menubar:no; scrollable:yes"
                + "; resizable:yes; location:no; directories:no; status:no; help:no; maximize:yes; minimize:yes";

        dialogArgs = new Array;
        dialogArgs["title"] = windowTitle;
        dialogArgs["type"] = "transcript";
        dialogArgs["xmlDom"] = transcriptHtml.documentElement.xml;
        dialogArgs["strings"] = gStrings.transcriptPrint_printPage;

        var newWindow = null;
        if (window.ActiveXObject) {
            newWindow = window.showModelessDialog(newWindowUri, dialogArgs, windowConfig);
        } else {
            var styleUri = "platform/styles/presentation.css";
            newWindow = window.open(newWindowUri, 'host', 'width=' + w + 'px, height=' + h + 'px,  toolbar=no, menubar=no, scrollbars=yes, resizable=yes, location=no, directories=no, status=no, help=no, maximize=yes, minimize=yes');
            var pageHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><meta http-equiv="content-type" content="application/xhtml+xml;charset=UTF-8" /><style type="text/css">html{overflow-y:visible !important;}</style><link type="text/css" rel="stylesheet" href="' + styleUri + '" /><script type="text/javascript" src="platform/ECMAScript/pagebehavior.js"></script><!--<script> window.onresize = function(){document.getElementById("transcriptPageContent").style.height = window.innerHeight + "px";}</script>--><title>' + windowTitle + '</title></head><body onload="windowOnLoad()"><div id="contentBlock" class="big"><div id="topBlock"><h1>' + topicTitle + '</h1><div id="transcriptPageContent"><div class="printLaunch"><p><u onclick="window.print();">' + gStrings.transcriptPrint_printPage + '</u></p></div>' + transcriptHtml.documentElement.xml + '</div></div></body></html>';
            newWindow.document.write(pageHTML);
            newWindow.document.close();
        }
		dynamicWindows.push(newWindow);
	}
}

function windowResize()
{
    if (document.getElementById("transcriptPageContent") != null)
    {
        document.getElementById("transcriptPageContent").style.width = Number(document.documentElement.clientWidth) - 15;
        document.getElementById("transcriptPageContent").style.height = Number(document.documentElement.clientHeight) - 40;
    }
}

function windowOnLoad()
{
    if (document.getElementById("transcriptPageContent") != null)
    {
        document.getElementById("transcriptPageContent").style.width = Number(document.documentElement.clientWidth) - 15;
        document.getElementById("transcriptPageContent").style.height = Number(document.documentElement.clientHeight) - 40;
    }
}

// Dynamically create a new window and insert the notes into this window to print.
function notesDynamicPrint(w, h, lang, parentXmlUri, windowTitle) {
	// Load the transcript text.
	var parentXml = new XmlDom();
	var success = parentXml.load(parentXmlUri);
	if (success == true) {
		// Grab the unparsed notes string.
		var notesPageDelimiter = "*$^%";
		var notesString = lmsGet_Notes();
		// If there are no notes available to print.
		if (notesString == "") {
			alert(gStrings["notes_noNotesToPrint"]);
		} else {

			var notesArray = notesString.split(notesPageDelimiter);

			// Grab the lesson manifest uri.
			var lessonManifestUri = parentXml.selectNodes("/topic/@lessonManifestUri")[0].value;
			// Load the lesson manifest.
			var lessonManifest = new XmlDom();
			var success = lessonManifest.load(lessonManifestUri);
			// Grab all the topic uris.
			var topicUris = lessonManifest.selectNodes("//topic/@uri");
			var lessonTitle = lessonManifest.selectNodes("//lessonManifest/@lessonTitle")[0].value

			// Create the notes HTML.
			var notesHtml = '<h1>' + gStrings["notes_printPageHeadingIntro"] + lessonTitle + '</h1>';
			for (var i = 0; i < topicUris.length; i++) {
				var currentTopicUri = topicUris[i].value;
				var pageXml = new XmlDom();
				var success = pageXml.load(currentTopicUri);
				if (success == true) {
					// If there are notes on this page.
					if (notesArray[i].length > 0) {
						var pageTitle = pageXml.selectNodes("/topic/@title")[0].value;
						notesHtml += '<h2>' + pageTitle + '</h2><p class="notesContent">' + notesArray[i].replace(/[\n]/g, '<br />') + '</p>';
					}
				}
			}

			var newWindowUri = "platform/interactive/host.htm";
            windowConfig = "dialogWidth:" + w + "px; dialogHeight:" + h 
                    +"px; dialogLeft:0; dialogTop:0; toolbar:no; menubar:no; scrollable:yes" 
                    +"; resizable:yes; location:no; directories:no; status:no; help:no; maximize:yes; minimize:yes; contextmenu:yes";

            var newWindow = window.showModelessDialog(newWindowUri, windowTitle.replace(/\s/g, "_") + String(dynamicWindows.length), windowConfig);

			var styleUri = "platform/styles/presentation.css";

			var pageHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head><meta http-equiv="content-type" content="application/xhtml+xml;charset=UTF-8" /><link type="text/css" media="screen" rel="stylesheet" href="' + styleUri + '" /><title>' + windowTitle + '</title></head><body><div id="notesPrintWindow"><div class="printLaunch"><p><u onclick="window.print();">' + gStrings.transcriptPrint_printPage + '</u></p></div>' + notesHtml + '</div></body></html>';

			newWindow.document.write(pageHTML);
			newWindow.document.close();

			newWindow.location.reload(false);	// This solves a weird print problem - the page is still waiting for write input.
			newWindow.focus();
			dynamicWindows.push(newWindow);

		}
	}
}

// return the current document's local url (no directory structure)
function docUrl() {
	var fullUrl;
	// return the full path for dom compliant browsers
	if (typeof document.location != "undefined") {
		var fullUrl = document.location.href;
	} else if (typeof document.URL != "undefined") {	// for IE until it is dom compliant
		var fullUrl = document.URL;
	} else {
		// throw an exception, the browser can't read the current url
		alert("error 26");
		return;
	}
	// determine the index that marks the boundary to the containing folder name
	var indexA = fullUrl.lastIndexOf("\\");
	var indexB = fullUrl.lastIndexOf("/");
	var lastIndex = 0;
	if (indexA > lastIndex)	{ lastIndex = indexA; }
	if (indexB > lastIndex)	{ lastIndex = indexB; }
	// use this index to strip out the folder heirarchy and leave the file name
	strippedUrl = fullUrl.substring(lastIndex + 1, fullUrl.length);
	return strippedUrl;
}
// return the current URI minus hash suffixes
function docUriMinusHash() {
	// current document's URL
	var currentUri = docUrl();
	var currentHash = document.location.hash;
	var spliceCutoff = currentHash.length * -1;
	// return the document's current URL minus the hash suffix
	return currentUri.slice(0, spliceCutoff);
}


// cookie functions
function setCookie(sName, sValue, oExpires, sPath, sDomain, bSecure) {
	var sCookie = sName + "=" + encodeURIComponent(sValue);

	if (isDef(oExpires)) {
		sCookie += "; expires=" + oExpires.toGMTString();
	}
	if (isDef(sPath)) {
		sCookie += "; path=" + sPath;
	}
	if (isDef(sDomain)) {
		sCookie += "; domain=" + sDomain;
	}
	if (isDef(bSecure)) {
		sCookie += "; secure";
	}
	document.cookie = sCookie;
}
function getCookie(sName) {
	var sRE = "(?:; )?" + sName + "=([^;]*);?";
	var oRE = new RegExp(sRE);

	if (oRE.test(document.cookie)) {
		return decodeURIComponent(RegExp["$1"]);
	} else {
		return "";
	}
}
function deleteCookie(sName, sPath, sDomain) {
	setCookie(sName, "", new Date(0), sPath, sDomain);
}
// is defined - true if it is defined, false if it is not defined
function isDef(oArg) {
	if (typeof oArg == "undefined") {
		return false;
	} else {
		return true;
	}
}

// add the current page to the visited pages cookie
function addPageUriToCookie() {
	// grab the url of the loaded xml content document
	var currentXmlContentDocUri = getLoadedContentUri();
	// give it an xml suffix
	currentXmlContentDocUri += ".xml";

	// grab all the urls within the visited pages cookie
	var visitedPageUrls = getCookie("visitedPages");

	// search for the current page's url within the visited pages string
	if (visitedPageUrls.indexOf(currentXmlContentDocUri) == -1) {	// the page url was not found in the string
		if (visitedPageUrls.length == 0) {
			var newCookieString = currentXmlContentDocUri;
		} else {
			var newCookieString = visitedPageUrls + "^^" + currentXmlContentDocUri;
		}
		setCookie("visitedPages", newCookieString);
	}
}

// return the URI of the xml page that is encoded after the default.html's hash
function contentPageUri() {
	var pageUri = new String();

	if (typeof(requestedContentUri) == "undefined") {
		pageUri = String(window.location.hash).slice(1) + ".xml";
	} else {
		pageUri = requestedContentUri + ".xml"
	}

	return pageUri;
}
// Return the lessonManifest uri of the page that is current loaded inside the preloader.
function getLessonManifestUri() {
	var currentPageUri = contentPageUri();
	var currentPage = new XmlDom();
	currentPage.load(currentPageUri);
	var lessonManifestUri = currentPage.selectNodes("/topic/@lessonManifestUri")[0];
	if (lessonManifestUri == null) {
		return false;
	} else {
		return lessonManifestUri.value;
	}
}
// Return the lessonManifest uri of the page that is current loaded inside the preloader.
function getContentLanguage(currentPageUri) {
	if (typeof(currentPageUri) == "undefined") {
		currentPageUri = contentPageUri();
	}
	var currentPage = new XmlDom();
	currentPage.load(currentPageUri);
	var pageLanguage = null;
	   
	pageLanguage = currentPage.selectNodes("/topic")[0].getAttributeNode('xml:lang');
	
	if (pageLanguage == null) {
		return false;
	} else {
		return pageLanguage.value.toLowerCase();
	}
}

// Find elements within the page that need reformatting and reformat them.
function reformatPageElements(docTreeRoot) {

	// Reformat click tables.
	var pageTables = docTreeRoot.getElementsByTagName("table");

	for (var i = 0; i < pageTables.length; i++) {
        if (pageTables[i].className == "click" || pageTables[i].className == "clickTableAnimation") {
			formatClickTable(pageTables[i],pageTables[i].className);
		}
	}

	// Reformat multiple choice question sets.
	var divElements = docTreeRoot.getElementsByTagName("div");

	for (var i = 0; i < divElements.length; i++) {
		if (divElements[i].className == "assessment")
		{
            if(divElements[i].parentNode.parentNode.parentNode.className == "multipleChoice000")
		        formatMultipleChoice(divElements[i]);
		    else if (divElements[i].parentNode.parentNode.parentNode.className == "trueFalse000")
			    formatTrueFalse(divElements[i]);
			else if (divElements[i].parentNode.parentNode.parentNode.className == "essayQuestion000")
			    formatEssayQuestion(divElements[i]);
		}
	}


	// Force focus onto Activities that lack intros.
	var objectElements = docTreeRoot.getElementsByTagName("object");
	for (var i = 0; i < objectElements.length; i++) {
		var activityType = objectElements[i].className;
		if (activityType == "sortGame" || activityType == "tileFlip" || activityType == "dragAndDrop" || activityType == "sequence") {

			// If there is not an element before this element (the overview div).
			var prevousElement = objectElements[i].previousSibling;
			if (prevousElement == null) {

				// Force focus onto the activity.
				objectElements[i].focus();
			}
		}
	}
}

// Reformat a table into a click table.
function formatClickTable(clickTableDomTree,clickTableClassName) {
	// Make every cell invisible and have a large rowspan.
	var tdElements = clickTableDomTree.getElementsByTagName("td");
	// If this table actually has cells, then format the click table.
	if (tdElements.length > 0) {
		for (var i = 0; i < tdElements.length; i++) {
			var newClassName = tdElements[i].className + " hidden";
			tdElements[i].className = newClassName;
		}
		// Make first td of every row visible.
		var tableRows = clickTableDomTree.getElementsByTagName("tr");
		for (var i = 0; i < tableRows.length; i++) {
			// Isolate the first element of each row.
                var className = tableRows[i].childNodes[0].className;
			// If the className is appended with " hidden", then remove that class.
			if (className.slice(-7) == " hidden") {
				// Put all the content in the first column inside an anchor tag so that we can
				//	throw a hover class on it so that it properly highlights before a click.
				tableRows[i].childNodes[0].innerHTML = '<a class="buttonTD">' + tableRows[i].childNodes[0].innerHTML + '</a>';
				// Make the first td visisble.
                tableRows[i].childNodes[0].className = className.slice(0, -7);
				tableRows[i].childNodes[0].onclick = function() {clickTableShowOtherRows(this,clickTableClassName); };
			}
		}
		// Give every td except the first of each row a maximum rowspan.
		var tableRows = clickTableDomTree.getElementsByTagName("tr");
		for (var i = 0; i < tableRows.length; i++) {
			for (var j = 1; j < tableRows[i].childNodes.length; j++) {
				var dataElementTagName = tableRows[i].childNodes[j].nodeName;
				if (dataElementTagName.toLowerCase() == "td") {
					tableRows[i].childNodes[j].setAttribute("rowSpan", tableRows.length);
				}
			}
		}

		// Set the first column td in the first row to "active".
		clickTableDomTree.firstChild.childNodes[1].firstChild.setAttribute("id", "active");

		// Set the height of the click table based on its tallest cell.
		clickTableSetHeight(clickTableDomTree, clickTableClassName);
	}
}
// Make each row after the heading row visible and measure the table's height.  Make the table the
//	maximum height.
function clickTableSetHeight(clickTableDomTree, clickTableClassName) {
	var maxTableHeight = 0;
	var maxContentDivHeight = 0;

	for (var i = 1; i < clickTableDomTree.firstChild.childNodes.length; i++) {
		// Make each click table rows visible and capture the maximum table height.
	    clickTableShowRow(clickTableDomTree.firstChild.childNodes[i].firstChild,false,clickTableClassName);
		var currentTableHeight = clickTableDomTree.clientHeight;
		maxTableHeight = (maxTableHeight > currentTableHeight ? maxTableHeight : currentTableHeight);
		// Capture the maximum content div height as well.
		// Go through each of the td's and check the height of the cellInner div's height.
		for (var j = 0; j < clickTableDomTree.firstChild.childNodes[1].childNodes.length; j++) {
			var currentContentDivHeight = clickTableDomTree.firstChild.childNodes[1].childNodes[j].firstChild.clientHeight;
			maxContentDivHeight = (maxContentDivHeight > currentContentDivHeight ? maxContentDivHeight : currentContentDivHeight);
		}
	}
	// Make the first row the visible one again.
    var isFirstRow = true;
    clickTableShowRowContent = true;
    clickTableShowRow(clickTableDomTree.firstChild.childNodes[1].firstChild, isFirstRow, clickTableClassName);
    isFirstRow = false;

	// Set the height of all the content divs in the first row to the maxContentDivHeight.
	for (var i = 1; i < clickTableDomTree.firstChild.childNodes.length; i++) {  // tr'screen
		for (var j = 1; j < clickTableDomTree.firstChild.childNodes[i].childNodes.length; j++) {	// td's
			clickTableDomTree.firstChild.childNodes[i].childNodes[j].style.height = String(maxContentDivHeight) + "px";
		}
	}

	// Set the table height to the max height
	clickTableDomTree.style.height = String(maxTableHeight) + "px";
}
// When the first td of a click table row is clicked, append that cell's sibblings into the first
//	row of the click table and make them visible.  Delete any of these appending cells from the
//	end of the first row first.
function clickTableShowRow(rowTdElement, isFirstRow, clickTableClassName) {

	var rowElement = rowTdElement.parentNode;
	var tableBodyElement = rowElement.parentNode;
	var firstContentRow = tableBodyElement.childNodes[1];

	// The number of table headers.
	var numberOfTableHeaders = tableBodyElement.childNodes[0].childNodes.length;

	// Trim off the td's off of the first row if it has more td's than the total number of table headers.
	if (clickTableClassName == "click") 
    {
	    while (firstContentRow.childNodes.length > numberOfTableHeaders) {
	        firstContentRow.removeChild(firstContentRow.lastChild);
	    }

	    // Add the td's from the supplied element's row.
	    var numberOfRowChildren = rowElement.childNodes.length;
	    for (var i = 1; i < numberOfRowChildren; i++) {

	        firstContentRow.appendChild(rowElement.childNodes[i].cloneNode(true));
	        var className = firstContentRow.lastChild.className;
	        // If the className is appended with " hidden", then remove that class.
	        if (className.slice(-7) == " hidden") {
	            firstContentRow.lastChild.className = className.slice(0, -7);
	        }
	    }
	}
	if (clickTableClassName == "clickTableAnimation") {
	    if (rowElement.rowIndex == 1 && clickTableFirstRowContent == null) 
        {
            clickTableFirstRowContent = rowTdElement.parentNode.parentNode.childNodes[1].childNodes[1];

	    }
	    // Trim off the td's off of the first row if it has more td's than the total number of table headers.
	    var isWmvClass = false;
	    if (rowElement.childNodes[1].childNodes[0].childNodes[0].className == "wmvMedia") {
	        isWmvClass = true;
	        firstContentRow.removeChild(firstContentRow.lastChild);

	    }
	    else {
	        while (firstContentRow.childNodes.length >=numberOfTableHeaders) {
	            firstContentRow.removeChild(firstContentRow.lastChild);
	        }
	    }

	    // Add the td's from the supplied element's row.
	    if (rowElement.rowIndex != 1 )
         {
	        var numberOfRowChildren = rowElement.childNodes.length;
	        for (var i = 1; i < numberOfRowChildren; i++) 
            {
	            // Duplicate each table data element.
	            firstContentRow.appendChild(rowElement.childNodes[i].cloneNode(true));
	            var currentMediaURI;
	            var paramObjs; var paramNode;
	            if (rowElement.childNodes[i].childNodes[0].childNodes[0] != undefined) 
                { // This check for other template tables (clickTable template)
	                if (rowElement.childNodes[i].childNodes[0].childNodes[0].className == "flashMedia") 
                    {
	                    paramObjs = rowElement.childNodes[i].getElementsByTagName("param");
	                    for (var paramCnt = 0; paramCnt < paramObjs.length; paramCnt++) 
                        {
	                        paramNode = paramObjs[paramCnt].cloneNode(true);
	                        if (paramNode.name == "PLAY" && isFirstRow == true) {
	                            paramNode.value = "true";
	                            firstContentRow.childNodes[1].childNodes[0].childNodes[0].appendChild(paramNode);
	                        }
	                    }
	                } 
                    else if (rowElement.childNodes[i].childNodes[0].childNodes[0].className == "wmvMedia") 
                    {
	                    paramObjs = rowElement.childNodes[i].getElementsByTagName("param");
	                    for (var paramCnt = 0; paramCnt < paramObjs.length; paramCnt++) 
                        {
	                        paramNode = paramObjs[paramCnt].cloneNode(true);
	                        firstContentRow.childNodes[1].childNodes[0].childNodes[0].childNodes[0].appendChild(paramNode);
	                    }
	                }
	            }
	        }
	    }
        else
        {
            if (clickTableFirstRowContent.childNodes[0].childNodes[0].className == "flashMedia") {
                clickTableFirstRowContent.innerHTML = clickTableFirstRowContent.innerHTML.replace('PARAM NAME="Play" VALUE="0"', 'PARAM NAME="Play" VALUE="1"');
            }
           firstContentRow.appendChild(clickTableFirstRowContent);
        }
        
        var className = firstContentRow.lastChild.className;
		// If the className is appended with " hidden", then remove that class.
		if (className.slice(-7) == " hidden") {
			firstContentRow.lastChild.className = className.slice(0, -7);
	    }
	}
	

	// Deactivate all first column tds.
	for (var i = 0; i < tableBodyElement.childNodes.length; i++) {
		tableBodyElement.childNodes[i].childNodes[0].removeAttribute("id");
	}
	// Activate the current td's first column td.
	rowTdElement.setAttribute("id", "active");
}

function clickTableShowOtherRows(rowTdElement, clickTableClassName) {
    clickTableShowRowContent = true;
    var rowElement = rowTdElement.parentNode;
    var tableBodyElement = rowElement.parentNode;
    isClicked = true;
    var isFirstRowFlash = false;
	var firstContentRow = tableBodyElement.childNodes[1];
	var numberOfTableHeaders = tableBodyElement.childNodes[0].childNodes.length;
	/*  ISSUE: if swf is uploaded in 1st row and wmv/xaml in 2nd Row, swf keeps playing till wmv loads via mediaplayer.js    */
	var flashObjects = document.getElementsByTagName("object");
    for(var objectCount = 0; objectCount < flashObjects.length; objectCount++)
    {
        try
        {
            if(flashObjects[objectCount].className == "flashMedia"){
            flashObjects[objectCount].StopPlay();
            }  
        }
        catch(err)
        {
        }
    }

    if (clickTableClassName == "click") {
        while (firstContentRow.childNodes.length > numberOfTableHeaders) {
            firstContentRow.removeChild(firstContentRow.lastChild);
        }

        // Add the td's from the supplied element's row.
        var numberOfRowChildren = rowElement.childNodes.length;
        for (var i = 1; i < numberOfRowChildren; i++) {

            firstContentRow.appendChild(rowElement.childNodes[i].cloneNode(true));
            var className = firstContentRow.lastChild.className;
            // If the className is appended with " hidden", then remove that class.
            if (className.slice(-7) == " hidden") {
                firstContentRow.lastChild.className = className.slice(0, -7);
            }
        }
    }

    if (clickTableClassName == "clickTableAnimation") {
        if (clickTableFirstRowContent.childNodes[0].childNodes[0].className == "flashMedia")
            isFirstRowFlash = true;
        if (rowElement.rowIndex == 1 && clickTableFirstRowContent == null) {
            clickTableFirstRowContent = firstContentRow;

        }
        // Trim off the td's off of the first row if it has more td's than the total number of table headers.
        var isWmvClass = false;
        if (rowElement.childNodes[1].childNodes[0].childNodes[0].className == "wmvMedia") {
            isWmvClass = true;
            firstContentRow.removeChild(firstContentRow.lastChild);

        }
        else {
            while (firstContentRow.childNodes.length >= numberOfTableHeaders) {
                firstContentRow.removeChild(firstContentRow.lastChild);
            }

        }
        clickTableFirstRowContent.childNodes[0].childNodes[0].childNodes[0].id = "mediaPlayerControl" + ((rowTdElement.parentNode.rowIndex==1)?"":"_"+rowTdElement.parentNode.rowIndex);
    //	// Add the td's from the supplied element's row.
        if (rowElement.rowIndex != 1) {
            var numberOfRowChildren = rowElement.childNodes.length;
            for (var i = 1; i < numberOfRowChildren; i++) {
                // Duplicate each table data element.
                if (rowElement.childNodes[i].childNodes[0].childNodes[0].className == "flashMedia" || isFirstRowFlash) {
                    firstContentRow.appendChild(rowElement.childNodes[i].cloneNode(true));
                }
                else {
                    clickTableFirstRowContent.childNodes[0].childNodes[0].childNodes[0].id = "mediaPlayerControl_" + rowTdElement.parentNode.rowIndex;
                    firstContentRow.appendChild(clickTableFirstRowContent);
                }
                var currentMediaURI;
                var paramObjs; var paramNode;
                if (rowElement.childNodes[i].childNodes[0].childNodes[0] != undefined) { // This check for other template tables (clickTable template)
                    if (rowElement.childNodes[i].childNodes[0].childNodes[0].className == "flashMedia") {
                        paramObjs = rowElement.childNodes[i].getElementsByTagName("param");
                        for (var paramCnt = 0; paramCnt < paramObjs.length; paramCnt++) {
                            paramNode = paramObjs[paramCnt].cloneNode(true);
                            if (paramNode.name == "PLAY") {
                                firstContentRow.childNodes[1].childNodes[0].childNodes[0].removeChild(firstContentRow.childNodes[1].childNodes[0].childNodes[0].childNodes[paramCnt]);
                                paramNode.value = "true";
                            }
                            firstContentRow.childNodes[1].childNodes[0].childNodes[0].appendChild(paramNode);
                        }
                    }
//commenting since this is failing in Preview mode. cloneNode is not working as expected in Preview mode with IE9.
//                    else if (rowElement.childNodes[i].childNodes[0].childNodes[0].className == "wmvMedia") {
//                        paramObjs = rowElement.childNodes[i].getElementsByTagName("param");
//                        for (var paramCnt = 0; paramCnt < paramObjs.length; paramCnt++) {
//                            paramNode = paramObjs[paramCnt].cloneNode(true);
//                            firstContentRow.childNodes[1].childNodes[0].childNodes[0].childNodes[0].appendChild(paramNode);
//                        }
//                    }
                }
            }
        }
        else {
            if (clickTableFirstRowContent.childNodes[0].childNodes[0].className == "flashMedia") {
                clickTableFirstRowContent.innerHTML = clickTableFirstRowContent.innerHTML.replace('PARAM NAME="Play" VALUE="0"', 'PARAM NAME="Play" VALUE="1"');
            }
            firstContentRow.appendChild(clickTableFirstRowContent);
        }
        var className = firstContentRow.lastChild.className;
		// If the className is appended with " hidden", then remove that class.
		if (className.slice(-7) == " hidden") {
		    firstContentRow.lastChild.className = className.slice(0, -7);
		}
    }
    
	// Deactivate all first column tds.
	for (var i = 0; i < tableBodyElement.childNodes.length; i++) {
		tableBodyElement.childNodes[i].childNodes[0].removeAttribute("id");
	}
	// Activate the current td's first column td.
rowTdElement.setAttribute("id", "active");
rowCount = rowTdElement.parentNode.rowIndex;
}
function getRowCount() {
    if (isClicked)
        return (rowCount-1);
    else
        return 0;
}
// Set up the multiple choice assessment.
function formatMultipleChoice(multipleChoiceDomTree) {

	// Run through each of these multiple choice entries and format it as visited if it's status is persisted in the LMS.
    if (scoAssessment != null && scoAssessment.getLmsSupport()) {
		// Don't include the hidden assessment feedback.
		for ( var i = 0; i < ( multipleChoiceDomTree.childNodes.length - 1 ); ++i ) {
			var multipleChoiceItem = multipleChoiceDomTree.childNodes[i];

			//
			setMultipleChoiceItemState( multipleChoiceItem,i );
		}
	}

	// If there is only one item (the assessment feedback), make it invisible.
	if (multipleChoiceDomTree.childNodes.length == 1) {
		var newClassName = multipleChoiceDomTree.firstChild.className + " hidden";
		multipleChoiceDomTree.firstChild.className = newClassName;
	} else {
		// Make all items following the first item invisible.
		for (var i = 1; i < multipleChoiceDomTree.childNodes.length; i++) {

			var newClassName = multipleChoiceDomTree.childNodes[i].className + " hidden";
			multipleChoiceDomTree.childNodes[i].className = newClassName;
		}
	}
	
	//Display active question arrow under the first question number.
	 var arrowPosition = 0 ;
	if((document.getElementById("pageContent").firstChild.childNodes[1].children.length)>0)
	{
	 arrowPosition = document.getElementById("pageContent").firstChild.childNodes[1].firstChild.offsetLeft - document.getElementById("pageContent").firstChild.offsetLeft;	 
	}
	document.getElementById("questionNumberArrow").style.marginLeft = arrowPosition + 8 + 'px';
}
// Format a multiple choice entry if it was persisted in the LMS.
function setMultipleChoiceItemState( multipleChoiceItem,itemPageOffset ) {

	if ( scoAssessment.getAssessmentCompletionStatus(itemPageOffset ) ) {

		// Get the learner's previous response.
		var learnerResponse = scoAssessment.getAssessmentLearnerResponse(itemPageOffset );
		var assessmentResult = scoAssessment.getAssessmentResult(itemPageOffset );

		configureCompletedAssessmentItem( multipleChoiceItem, itemPageOffset, learnerResponse, assessmentResult );
	}
}

// Makes the specified question number visible and makes all others within this assessment invisible.
function activateQuestion(buttonNode, questionNumber) {
	// Loop through all the button nodes and make them inactive.
	for (var i = 0; i < buttonNode.parentNode.parentNode.childNodes.length; i++) {
        var questionClassName = buttonNode.parentNode.parentNode.childNodes[i].firstChild.className;
	    if (questionClassName.slice(-7) == " active")
	    {
		    buttonNode.parentNode.parentNode.childNodes[i].firstChild.className = questionClassName.slice(0, -7);
		}
	}

	// Make the button specifying the current assessment item active and make all others inactive.
	var buttonNodeClassName = buttonNode.className;
	buttonNode.className = buttonNodeClassName + " active";

	// Isolate the assessment level element.
	var assessmentNode = buttonNode.parentNode.parentNode.parentNode.parentNode.lastChild;

	//Variable for holding the position of the item to make visible
	var activeQuestion;

	// Make all items invisible.
	for (var i = 0; i < assessmentNode.childNodes.length; i++) {
		// If the itemNode isn't already invisible.
		if (assessmentNode.childNodes[i].className.slice(-7) != " hidden") {
			var newClassName = assessmentNode.childNodes[i].className + " hidden";
			assessmentNode.childNodes[i].className = newClassName;
		}
		var itemPageOffset = assessmentNode.childNodes[i].className;
		itemPageOffset = itemPageOffset.match( /itemParent itemParent[0-9]{1,2}/ );
		itemPageOffset = Number( String( itemPageOffset ).slice( 21 ) );
		if (itemPageOffset == questionNumber)
		    activeQuestion = i;
	}
	// Make the specified question number visible.
	var className = assessmentNode.childNodes[activeQuestion].className;
	// If the className is appended with " hidden", then remove that class.
	if (className.slice(-7) == " hidden") {
		assessmentNode.childNodes[activeQuestion].className = className.slice(0, -7);
	}
	
	//Display arrow indicator for active quesion
	var arrowPosition = document.getElementById("pageContent").firstChild.childNodes[1].childNodes[activeQuestion].offsetLeft - document.getElementById("pageContent").firstChild.offsetLeft;
	document.getElementById("questionNumberArrow").style.marginLeft = arrowPosition + 8 + 'px';
}
// Activate the submit button so that this question is ready to answer.
function activateSubmit(submitButtonDiv) {
	if (submitButtonDiv.disabled == true) {
		// Style the submit button so that it looks ready to click.
		submitButtonDiv.removeAttribute("disabled");
		// Add an onclick event handler to this submit button.
		submitButtonDiv.onclick = configureCompletedAssessmentItem;
	}
}

function configureCompletedAssessmentItem( itemNode, itemPageOffset, learnerResponse, assessmentResult ) {

	// If this funciton is not being called as an event callback, then use the first argument as itemNode.
	if(window.ActiveXObject)
	{
	    if (typeof itemNode == "undefined" || itemNode.target != null) {
		    var itemNode = this.parentNode;

		    var restoredFromLms = false;
	    } else {
		    var restoredFromLms = true;
	    }
	}else
	{
        //Firefox sends itemNode as Event for the first time
	    if(itemNode.target != null)
	    {
	        var itemNode = this.parentNode;
    		var restoredFromLms = false;
	    }else
	    {
		    var restoredFromLms = true;
	    }
	}
	
	// If the learner response is specified, then update the appropriate radio button with the learner "checked" property.
	if (typeof learnerResponse != "undefined" ) {
		var radioButtons = itemNode.getElementsByTagName("input");
		var correctRadioButton = Number( learnerResponse );
		radioButtons[correctRadioButton].parentNode.childNodes[0].checked = true;
	}

	// Make the current item's text appear inactive (by adding the "inactive" class to the itemParent).
	if (itemNode.className.slice(-9) != " inactive") {
		var newClassName = itemNode.className + " inactive";
		itemNode.className = newClassName;
	}
	// Inactivate the current item's radio buttons and add true and false images to each answer.
	// Also keep track if the assessment was correctly answered.
	var assessmentAnsweredCorrectly = true;
	var learnerResponse = 0;
	var correctResponse = 0;

	var radioButtons = itemNode.getElementsByTagName("input");
	for (var i = 0; i < radioButtons.length; i++) {
		radioButtons[i].disabled = true;

		// Create a true and false image element (to clone and insert into the answer).
		var imageTrue = document.createElement("img");
		imageTrue.setAttribute("src", "platform/images/go.gif");
		imageTrue.className = "imageCorrect";
		imageTrue.setAttribute("alt", "correct");
		imageTrue.setAttribute("title", "correct");
		var imageFalse = document.createElement("img");
		imageFalse.setAttribute("src", "platform/images/nogo.gif");
		imageFalse.className = "imageIncorrect";
		imageFalse.setAttribute("alt", "incorrect");
		imageFalse.setAttribute("title", "incorrect");

		// If this answer is true, then insert a clone of the true image.
		if (radioButtons[i].parentNode.parentNode.firstChild.firstChild.className == "true") {
			radioButtons[i].parentNode.parentNode.firstChild.insertBefore(imageTrue.cloneNode(true), radioButtons[i].parentNode.parentNode.firstChild.lastChild);
			correctResponse = i;
		} else {
			// Otherwise, insert a clone of the false image.
			radioButtons[i].parentNode.parentNode.firstChild.insertBefore(imageFalse.cloneNode(true), radioButtons[i].parentNode.parentNode.firstChild.lastChild);
		}
		// Check to see if an answer is the answer is wrong.
		var answerCorrect = (radioButtons[i].parentNode.childNodes[0].className == "true");
		if (answerCorrect != radioButtons[i].parentNode.childNodes[0].checked) {
			assessmentAnsweredCorrectly = false;
		}
		// When you find the currently selected radio button, transfer its corresponding feedback into the assessment feedback div.
		if (radioButtons[i].parentNode.childNodes[0].checked == true) {
		    if(gSettings.assessments_displayFeedback == "true")
		    {
			    itemNode.parentNode.lastChild.childNodes[1].innerHTML = "<p>" + radioButtons[i].parentNode.parentNode.lastChild.innerHTML + "</p>";
			}
			learnerResponse = i;
		}
	}

	// Inactivate the current item's submit button.
	var buttonElement = itemNode.childNodes[6];
	buttonElement.disabled = true;
	buttonElement.onclick = null;

	//Check whether the questions were answered correctly and Highlight the answered questions
	if ( restoredFromLms )
	{
	    var listElement = itemNode.parentNode.parentNode.childNodes[0].childNodes[1].childNodes[itemPageOffset].firstChild;
	    listElement.innerText = "";
	    if (assessmentResult == "correct")
	    {
	        listElement.setAttribute("title", gStrings.multipleChoice_feedbackCorrect);
  	        listElement.className = "toggleQuestion Correct";
	    }
	    else if (assessmentResult == "wrong")
	    {
	        listElement.setAttribute("title", gStrings.multipleChoice_feedbackIncorrect);
	        listElement.className = "toggleQuestion Incorrect";
	    }
	}

	if ( !restoredFromLms ) {
	
	    //Get the item offset position
		var itemPageOffset = getItemPosition( itemNode);
			
		// Persist the assessment result to the LMS
		if ( scoAssessment.getLmsSupport() ) {

			// Persist the learner response and result.
			scoAssessment.setLmsAssessmentLearnerResponse(itemPageOffset, learnerResponse, correctResponse );
		}
		//Highlight the number button to show correct or wrong answer
        var listElement = itemNode.parentNode.parentNode.childNodes[0].childNodes[1].childNodes[itemPageOffset].firstChild;
        listElement.innerText = "";
        if (assessmentAnsweredCorrectly == true) {
            listElement.setAttribute("title", gStrings.multipleChoice_feedbackCorrect);
            listElement.className = "toggleQuestion Correct";
        }
        else {
            listElement.setAttribute("title", gStrings.multipleChoice_feedbackIncorrect);
            listElement.className = "toggleQuestion Incorrect";
        }

		 if(gSettings.assessments_displayFeedback == "true")
		 {
		    // Make the assessment feedback visible.
		    var assessmentFeedbackNode = itemNode.parentNode.lastChild;
		    var className = assessmentFeedbackNode.className;
		    if (className.slice(-7) == " hidden") {
			    assessmentFeedbackNode.className = className.slice(0, -7);
		    }
		    // Insert whether or not the assessment was correctly answered or not.
		    if (assessmentAnsweredCorrectly == true) {
			    assessmentFeedbackNode.firstChild.innerHTML = "<h3>" + gStrings.multipleChoice_feedbackCorrect + "</h3>";
		    } else {
			    assessmentFeedbackNode.firstChild.innerHTML = "<h3>" + gStrings.multipleChoice_feedbackIncorrect + "</h3>";
		    }
		 }
	}
}

//Set up True False Assessment
function formatTrueFalse(trueFalseDomTree) {

	// Run through each True False entry and format it as visited if it's status is persisted in the LMS.
	if (scoAssessment != null && scoAssessment.getLmsSupport() ) {
		// Don't include the hidden assessment feedback.
		for ( var i = 0; i < ( trueFalseDomTree.childNodes.length - 1 ); ++i ) {
			var trueFalseItem = trueFalseDomTree.childNodes[i];
			setTrueFalseItemState( trueFalseItem,i);
		}
	}

	// If there is only one item (the assessment feedback), make it invisible.
	if (trueFalseDomTree.childNodes.length == 1) {
		var newClassName = trueFalseDomTree.firstChild.className + " hidden";
		trueFalseDomTree.firstChild.className = newClassName;
	} else {
		// Make all items following the first item invisible.
		for (var i = 1; i < trueFalseDomTree.childNodes.length; i++) {
            var newClassName = trueFalseDomTree.childNodes[i].className + " hidden";
			trueFalseDomTree.childNodes[i].className = newClassName;
		}
	}
	
	//Display active question arrow under the first question number.
	var arrowPosition = 0 ;
	if((document.getElementById("pageContent").firstChild.childNodes[1].children.length)>0)
	{	
	 arrowPosition = document.getElementById("pageContent").firstChild.childNodes[1].firstChild.offsetLeft - document.getElementById("pageContent").firstChild.offsetLeft;	 
	}
	document.getElementById("questionNumberArrow").style.marginLeft = arrowPosition + 8 + 'px';
}

// Format a True False entry if it was persisted in the LMS.
function setTrueFalseItemState( trueFalseItem,itemPageOffset ) {
	if ( scoAssessment.getAssessmentCompletionStatus(itemPageOffset ) ) {
		// Get the learner's previous response.
		var learnerResponse = scoAssessment.getAssessmentLearnerResponse(itemPageOffset );
		var assessmentResult = scoAssessment.getAssessmentResult(itemPageOffset );
		configureCompletedTrueFalseAssessmentItem( trueFalseItem, itemPageOffset, learnerResponse, assessmentResult );
	}
}

// True False template: Activate the submit button so that this question is ready to answer.
// On click of Submit, display feedback
function activateTrueFalseSubmit(submitButtonDiv) {

	if (submitButtonDiv.disabled == true) {
		// Style the submit button so that it looks ready to click.
		submitButtonDiv.removeAttribute("disabled");
		// Add an onclick event handler to this submit button.
		submitButtonDiv.onclick=configureCompletedTrueFalseAssessmentItem;
	}
}


//Configure True False Assessment
function configureCompletedTrueFalseAssessmentItem( itemNode, itemPageOffset, learnerResponse, assessmentResult ) {
	if(window.ActiveXObject)
	{
		// If this funciton is not being called as an event callback, then use the first argument as itemNode.
	    if (typeof itemNode == "undefined" || itemNode.target != null) {
		    var itemNode = this.parentNode;

		    var restoredFromLms = false;
	    } else {
		    var restoredFromLms = true;
	    }
	    
	}else
	{
        //Firefox sends itemNode as Event for the first time
	    if(itemNode.target != null)
	    {
	        var itemNode = this.parentNode;
    		var restoredFromLms = false;
	    }else
	    {
		    var restoredFromLms = true;
	    }
	}
	// If the learner response is specified, then update the appropriate radio button with the learner "checked" property.

	if (typeof learnerResponse != "undefined" ) {
		var radioButtons = itemNode.getElementsByTagName("input");
		//var correctRadioButton = Number( learnerResponse );
		if (learnerResponse == "true")
		    radioButtons[0].checked = true;
		else
		    radioButtons[1].checked = true;
	}

	// Make the current item's text appear inactive (by adding the "inactive" class to the itemParent).
	if (itemNode.className.slice(-9) != " inactive") {
		var newClassName = itemNode.className + " inactive";
		itemNode.className = newClassName;
	}

	// Inactivate the current item's radio buttons and add true and false images to each answer.
	// Also keep track if the assessment was correctly answered.
	var assessmentAnsweredCorrectly = true;
	var learnerResponse = 0;
	var correctResponse = 0;

	var radioButtons = itemNode.getElementsByTagName("input");
	for (var i = 0; i < radioButtons.length; i++) {
		radioButtons[i].disabled = true;

		// Create a true and false image element (to clone and insert into the answer).
		var imageTrue = document.createElement("img");
		imageTrue.setAttribute("src", "platform/images/go.gif");
		imageTrue.className = "imageCorrect";
		imageTrue.setAttribute("alt", "correct");
		imageTrue.setAttribute("title", "correct");
		var imageFalse = document.createElement("img");
		imageFalse.setAttribute("src", "platform/images/nogo.gif");
		imageFalse.className = "imageIncorrect";
		imageFalse.setAttribute("alt", "incorrect");
		imageFalse.setAttribute("title", "incorrect");
    }

	// If this answer is true, then insert a clone of the true image.
	if (radioButtons[0].className == "true")
	{
	    radioButtons[0].parentNode.insertBefore(imageTrue.cloneNode(true), radioButtons[0].parentNode.lastChild);
	    radioButtons[1].parentNode.insertBefore(imageFalse.cloneNode(true), radioButtons[1].parentNode.lastChild);
	}
	else
	{
	    radioButtons[0].parentNode.insertBefore(imageFalse.cloneNode(true), radioButtons[0].parentNode.lastChild);
	    radioButtons[1].parentNode.insertBefore(imageTrue.cloneNode(true), radioButtons[1].parentNode.lastChild);
	}

	// Check to see if an answer is correct or wrong.
    correctResponse = radioButtons[0].className;

	if (radioButtons[0].checked){ learnerResponse = "true"; }
	    else { learnerResponse = "false"; }

	if (learnerResponse == correctResponse)
	{
		assessmentAnsweredCorrectly = true;
		//Feedback text
		if(gSettings.assessments_displayFeedback == "true")
		{
    		itemNode.parentNode.lastChild.childNodes[1].innerHTML = "<p>" + itemNode.childNodes[1].innerHTML + "</p>";
		}
	}
	else
	{
	    assessmentAnsweredCorrectly = false;
	    //Feedback text
	    if(gSettings.assessments_displayFeedback == "true")
		{
	        itemNode.parentNode.lastChild.childNodes[1].innerHTML = "<p>" + itemNode.childNodes[2].innerHTML + "</p>";
	    }
	}

	// Inactivate the current item's submit button.
	//var buttonElement = itemNode.lastChild;
	var buttonElement = itemNode.childNodes[3];
	buttonElement.disabled = true;
	buttonElement.onclick = null;

	//Check whether the questions were answered correctly and Highlight the answered questions
	if ( restoredFromLms )
	{
	    var listElement = itemNode.parentNode.parentNode.childNodes[0].childNodes[1].childNodes[itemPageOffset].firstChild;
	    listElement.innerText = "";
	    if (assessmentResult == "correct")
	    {
	        listElement.title = gStrings.multipleChoice_feedbackCorrect;
	        listElement.className = "toggleQuestion Correct";
	    }
	    else if (assessmentResult == "wrong")
	    {
	        listElement.title = gStrings.multipleChoice_feedbackIncorrect;
	        listElement.className = "toggleQuestion Incorrect";
	    }
	}

	if ( !restoredFromLms ) {
	
	    //Get the item offset position
		var itemPageOffset = getItemPosition( itemNode);
			
		// Persist the assessment result to the LMS
		if ( scoAssessment.getLmsSupport() ) {

            // Persist the learner response and result.
			scoAssessment.setLmsAssessmentLearnerResponse(itemPageOffset, learnerResponse, correctResponse );
		}
		
		 //Highlight the number button to show correct or wrong answer
        var listElement = itemNode.parentNode.parentNode.childNodes[0].childNodes[1].childNodes[itemPageOffset].firstChild;
        listElement.innerText = "";
        if (assessmentAnsweredCorrectly == true) {
            listElement.title = gStrings.multipleChoice_feedbackCorrect;
            listElement.className = "toggleQuestion Correct";
        }
        else {
            listElement.title = gStrings.multipleChoice_feedbackIncorrect;
            listElement.className = "toggleQuestion Incorrect";
        }

		if(gSettings.assessments_displayFeedback == "true")
		{
		    // Make the assessment feedback visible.
		    var assessmentFeedbackNode = itemNode.parentNode.lastChild;
		    var className = assessmentFeedbackNode.className;
		    if (className.slice(-7) == " hidden") {
			    assessmentFeedbackNode.className = className.slice(0, -7);
		    }
		    // Insert whether or not the assessment was correctly answered or not.
		    if (assessmentAnsweredCorrectly == true) {
			    assessmentFeedbackNode.firstChild.innerHTML = "<h3>" + gStrings.multipleChoice_feedbackCorrect + "</h3>";
		    } else {
			    assessmentFeedbackNode.firstChild.innerHTML = "<h3>" + gStrings.multipleChoice_feedbackIncorrect + "</h3>";
		    }
		}
	}
}

function getItemPosition (itemNode)
{
    var assessmentNode = itemNode.parentNode;
    var itemPageOffset = itemNode.className;
		itemPageOffset = itemPageOffset.match( /itemParent itemParent[0-9]{1,2}/ );
		itemPageOffset = Number( String( itemPageOffset ).slice( 21 ) );

    //Parse through the nodes and get the position of the selected node
	for (var i = 0; i < assessmentNode.childNodes.length; i++) {
		var node = assessmentNode.childNodes[i];
		var nodeOffset = node.className;
		nodeOffset = nodeOffset.match( /itemParent itemParent[0-9]{1,2}/ );
		nodeOffset = Number( String( nodeOffset ).slice( 21 ) );
		if (nodeOffset == itemPageOffset){
		    return i;
		}
	}
}

function formatEssayQuestion(essayQuestionDomTree)
{
    if (scoAssessment != null && scoAssessment.getLmsSupport())
    {
        setEssayQuestionItemState( essayQuestionDomTree,0 );
    }
}

// Format an essay question if it was persisted in the LMS.
function setEssayQuestionItemState( essayQuestionDomTree,itemPageOffset ) {
	if ( scoAssessment.getAssessmentCompletionStatus(itemPageOffset ) ) {
		// Get the learner's previous response.
		var learnerResponse = scoAssessment.getAssessmentLearnerResponse(itemPageOffset );
		var itemNode = essayQuestionDomTree.firstChild;
		configureCompletedEssayItem( itemNode, itemPageOffset, learnerResponse );
	}
}

function configureCompletedEssayItem(itemNode, itemPageOffset, learnerResponse)
{
    if ( typeof learnerResponse == "undefined" ) {
		var restoredFromLms = false;
	} else {
		var restoredFromLms = true;
	}

    if (itemNode.className.slice(-9) != " inactive") {
		var newClassName = itemNode.className + " inactive";
		itemNode.className = newClassName;
	}

	//Inactivate the text area
	var textElement = itemNode.childNodes[0].childNodes[3].firstChild;
	if ( restoredFromLms )
	{
	    textElement.value = learnerResponse;
	}
	textElement.setAttribute("readOnly", "true");
	if (textElement.className.slice(-9) != " inactive") {
    var newClassName = textElement.className + " inactive";
		textElement.className = newClassName;
	}

	//Inactivate the submit button
	var buttonElement = itemNode.childNodes[1];
	buttonElement.disabled = true;
	buttonElement.onclick = null;
	if ( !restoredFromLms ) {
		// Persist the assessment result to the LMS
		if ( scoAssessment.getLmsSupport() ) {
			// Persist the learner response and result.
			var learnerResponse =  textElement.value ;
			scoAssessment.setLmsAssessmentLearnerResponse(0, learnerResponse );
        }
    }
}

function validateAnswerText(answerTextfield, maxChars)
{
    //Activate Submit button if user types text
    var buttonNode = answerTextfield.parentNode.parentNode.parentNode.childNodes[1];
    if (answerTextfield.value == "" || answerTextfield.value == gStrings["essayQuestion_answerInstruction"])
        buttonNode.disabled = true;
    else
        buttonNode.removeAttribute("disabled");

    //Limit answer length to 250 characters
    var answerLength = answerTextfield.value.length;
    if (answerLength <= maxChars)
        return;
    else
        answerTextfield.value = answerTextfield.value.substring(0,maxChars);

}

function activateText(answerTextfield, isActive)
{
    var instructionText = gStrings["essayQuestion_answerInstruction"];
    if (isActive)
    {
        if (answerTextfield.value == instructionText)
            answerTextfield.value = "";
    }
    else
    {
        if (answerTextfield.value == "")
        answerTextfield.value = instructionText;
    }
}

// Capture desired key events and translate them into desired behavior.
document.onkeydown = function(event) {
if(window.ActiveXObject)
{
    event=window.event;
    var keyCode = window.event.keyCode;
}
else
    var keyCode = event.which;
    
	// Capture Control + N, re-route the event, and exit.
	if (keyCode == 78) {	// If the letter 'n' is pressed.
		// If the control key is pressed.
		if (event.ctrlKey == true) {
			event.keyCode = 999;
			return false;
		}
	// If Control + 3 is pressed.
	} else if (keyCode == 51) {
		// If the control key is pressed.
		if (event.ctrlKey == true) {
			var contentWheelObject = document.getElementById("scoNavigation");
			if (contentWheelObject != null) {
				contentWheelObject.focus();
			}
			return false;
		}
	// If Control + 4 is pressed.
	} else if (keyCode == 52) {
		// If the control key is pressed.
		if (event.ctrlKey == true) {
			var notesObject = document.getElementById("notesContent");
			if (notesObject != null) {
				notesObject.focus();
			}
			return false;
		}
	// Captures F5 press, re-routes the event, and exits.
	} else if (keyCode == 116) {
//		event.keyCode = 999;
		return false;
	}
}
document.onkeyup = function(event) {
	// If the control key is pressed.
	if(window.ActiveXObject)
	{
	    if (window.event.ctrlKey == true) {
		    window.event.keyCode = 999;
		    return false;
	    }
	}
	else
	{
	    if(event.ctrlKey == true){
//	        event.which = 999;
	        return false;
	    }
	}
}

// Capture the right click and cancel the event bubbling.
document.oncontextmenu = function(event) {
    if(window.ActiveXObject)
    {    
        if (window.event.srcElement.id == "captionMediaControl" || window.event.srcElement.id == "sortGameControl" || window.event.srcElement.id == "tileFlipControl" || window.event.srcElement.id == "dragAndDropControl" || window.event.srcElement.id == "adventureControl" 
            || window.event.srcElement.id == "mediaControl" || window.event.srcElement.id == "keyPointsControl" || window.event.srcElement.id == "interactiveJobAidControl" || window.event.srcElement.id == "sliderControl")
        { 
            // Dont cancel the event bubbling.
        }
        else
        {
	        window.event.cancelBubble = true;
	        window.event.returnValue = false;
	        return false;
	    }
	}
	else
	{
	    if (event.target.id == "captionMediaControl" || event.target.id == "sortGameControl" || event.target.id == "tileFlipControl" || event.target.id == "dragAndDropControl" || event.target.id == "adventureControl" 
            || event.target.id == "mediaControl" || event.target.id == "keyPointsControl" || event.target.id == "interactiveJobAidControl" || event.target.id == "sliderControl")
        { 
            // Dont cancel the event bubbling.
        }
        else
        {
	        event.cancelBubble = true;
	        event.returnValue = false;
	        return false;
	    }
	}
}

function importJavascript( fileUri ) {
	var headElement = document.documentElement.firstChild;

	 var scriptElement = document.createElement("script");
	scriptElement.setAttribute("type", "text/javascript");
	scriptElement.setAttribute("src", fileUri);

	headElement.appendChild(scriptElement);
}

function hideTranscript(sender){
    var imageDisplayed = (sender.src).slice(-9,-4);
    if(imageDisplayed == "right"){
        sender.src = "platform/images/arrow_down.png";
        sender.parentNode.nextSibling.style.display = "none";
        
    }else if(imageDisplayed == "_down"){
        sender.src = "platform/images/arrow_right.png"
        sender.parentNode.nextSibling.style.display = "";
    }
}               

function showHide(c_img)
{
    if(c_img.parentNode.id == "ShowHideAll")
    {
        if(c_img.parentElement.childNodes[1].innerText ==  gStrings.showHide_ShowAll)
        {
            if(c_img.className == "showAllArrow")
            {
                c_img.src = "platform/images/arrow_down.png";
                c_img.title = gStrings.showHide_HideAll;
            }
            else if(c_img.className == "showAllText")
            {
                c_img.previousSibling.src = "platform/images/arrow_down.png";
                c_img.previousSibling.title =  gStrings.showHide_HideAll;
            }
            c_img.parentElement.childNodes[1].innerText =  gStrings.showHide_HideAll;
            c_img.parentElement.childNodes[1].title =  gStrings.showHide_HideAll;
            for(var i = 0; i < 10; i++)
            {//check if the heading content is not null. only then, display the heading
                if(c_img.parentNode.parentNode.childNodes[2].childNodes[i].children.length != "1")
                {
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[2].className = "textShow";
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[1].title = gStrings.showHide_Hide;
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[0].title = gStrings.showHide_Hide;
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[0].src = "platform/images/arrow_down.png";
                }
            }
        }
        else if(c_img.parentElement.childNodes[1].innerText ==  gStrings.showHide_HideAll)
        {
            if(c_img.className == "showAllArrow")
            {
                c_img.src = "platform/images/arrow_right.png";
                c_img.title =  gStrings.showHide_ShowAll;
            }
            else if(c_img.className == "showAllText")
            {
                c_img.previousSibling.src = "platform/images/arrow_right.png";
                c_img.previousSibling.title =  gStrings.showHide_ShowAll;
            }
            c_img.parentElement.childNodes[1].innerText =  gStrings.showHide_ShowAll;
            c_img.parentElement.childNodes[1].title =  gStrings.showHide_ShowAll;
            for(var i = 0; i < 10; i++)
            {
                if(c_img.parentNode.parentNode.childNodes[2].childNodes[i].children.length != "1")
                {
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[2].className = "textHide";
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[1].title = gStrings.showHide_Show;
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[0].title = gStrings.showHide_Show;
                    c_img.parentNode.parentNode.childNodes[2].childNodes[i].childNodes[0].src = "platform/images/arrow_right.png";
                }
            }
        }
    }
    else if(c_img.className == "showHideHeadingArrow")
    {
        if (c_img.nameProp == "arrow_right.png") 
        {
            c_img.src = "platform/images/arrow_down.png"; 
            c_img.title = gStrings.showHide_Hide;
            c_img.nextSibling.title = gStrings.showHide_Hide;
            c_img.parentElement.childNodes[2].className = "textShow";
        }
        else 
        {
            c_img.src = "platform/images/arrow_right.png";
            c_img.title = gStrings.showHide_Show;
            c_img.nextSibling.title = gStrings.showHide_Hide;
            c_img.parentElement.childNodes[2].className = "textHide";
        }
    }
    else if (c_img.className == "showHideHeadingText")
    {
        if (c_img.previousSibling.nameProp == "arrow_right.png")
        {
            c_img.previousSibling.src = "platform/images/arrow_down.png";
            c_img.title = gStrings.showHide_Hide;
            c_img.previousSibling.title = gStrings.showHide_Hide;
            c_img.parentElement.childNodes[2].className = "textShow";
        }
        else
        {
            c_img.previousSibling.src = "platform/images/arrow_right.png";
            c_img.title = gStrings.showHide_Show;
            c_img.previousSibling.title = gStrings.showHide_Show;
            c_img.parentElement.childNodes[2].className = "textHide";
        }
    }
}

function pageResize()
{
    if (Number(document.documentElement.clientWidth) > 25) {
        try {
            document.getElementById("pageContent").style.width = Number(document.documentElement.clientWidth) - 25 + "px";
            document.getElementById("pageContent").style.height = Number(document.documentElement.clientHeight) - 40 + "px";
        } catch (e) {

        }
    }
}


// SIG // Begin signature block
// SIG // MIIbDAYJKoZIhvcNAQcCoIIa/TCCGvkCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFFUD7K9WoZ5Q
// SIG // KHEOaqZIr7oY0nQIoIIV5zCCBIUwggNtoAMCAQICCmEI
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
// SIG // AQICCmED3PYAAAAAAAwwDQYJKoZIhvcNAQEFBQAwdzEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEhMB8GA1UEAxMYTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgUENBMB4XDTA4MDcyNTE5MTI1
// SIG // MFoXDTExMDcyNTE5MjI1MFowgbMxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xDTALBgNVBAsTBE1PUFIxJzAlBgNVBAsTHm5D
// SIG // aXBoZXIgRFNFIEVTTjoxNTlDLUEzRjctMjU3MDElMCMG
// SIG // A1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vydmlj
// SIG // ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
// SIG // AMDtgRShXnfAW/R2iWL6rXxoFLT3vTXYE3laF8rZbFFF
// SIG // YiZ6Lx/Y6sFuARf5w6YfZ9tRsCzeihft/yCtNOqY+6XW
// SIG // KtLxRCcHWi06k/9WU7DI9fMD8knMFtD1AExY+Jv1ByWx
// SIG // ZhfAvcjSUoWNwis4ssM2vvmH2vSOXUPXBr+ZBZ+kzv6r
// SIG // jWFj5znF8xj22PwxNmlyWqIaTD7qhyVCndE+8ZfSGDKT
// SIG // cFVTgR7jOw3ovoJ4beb6zZikb9vuZvSVyM01yZ67Ng2D
// SIG // lpQmp5DgqTQ71cCePvDUR42GDIKkWDA6HHbjrZVmtLf9
// SIG // CYoFYA+jD+KTllginJ0r26KUGJCVAr0GQJUCAwEAAaOC
// SIG // ARkwggEVMB0GA1UdDgQWBBTS7Q0eJLs3qdggak0d0hbV
// SIG // Lr6e6zAfBgNVHSMEGDAWgBQjNPjZUkZwCu1A+3b7syuw
// SIG // wzWzDzBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNyb3NvZnRUaW1lU3RhbXBQQ0EuY3JsMFgGCCsGAQUF
// SIG // BwEBBEwwSjBIBggrBgEFBQcwAoY8aHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNyb3NvZnRU
// SIG // aW1lU3RhbXBQQ0EuY3J0MBMGA1UdJQQMMAoGCCsGAQUF
// SIG // BwMIMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0BAQUF
// SIG // AAOCAQEAnApVyMxEEzQM2GMndn0++jgyg1Od8gj5MvXF
// SIG // bnChybFjaxmdCWfZneuKattgZunpUibzO8Zq08JSvqi5
// SIG // 62qqeIzJFn2QlaDMIbOegb3NwYspvWIl7wlX54ZOKuyA
// SIG // yrv8IRbEP05SGeYOsdjBwnmQZLRQcxA1Xl0Rwbi6qs9S
// SIG // 9oCRAObvUUNG6dDolPYsJA2KxrIxiqN+NmykBUxnByq7
// SIG // uxClpTAactAGIDskk1sV2TmT03MtGsTUbB6hCOz2Mbhr
// SIG // S+zuXDMCFDKMfBEgLyADf/kMnbjTnl/WCPyBoJm4u1Vu
// SIG // zUJLOk2MFCvKyBLTYm7qDQqdCaNm2XlPjhqi/8yYBDCC
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
// SIG // ARUwIwYJKoZIhvcNAQkEMRYEFIWgbXHlS5PgykrpaGxl
// SIG // R07/1S3JMF4GCisGAQQBgjcCAQwxUDBOoCaAJABNAGkA
// SIG // YwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4AZ6Ek
// SIG // gCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVhcm5p
// SIG // bmcgMA0GCSqGSIb3DQEBAQUABIIBAIltf/6Y8WTxkYHC
// SIG // /WSmrliXdVdwpLgH/fgqNNl2nMTibywfD7WEeq5vqJK5
// SIG // gzGDnyOL9MNbDJybqWMPcwTic/ZoaT1Y5Ex8ZvzYLbXC
// SIG // pizxRgFa+MxRvXBzIMTFz1AKYK19RO1BepvjuxhpViLW
// SIG // fWeb42u2WF1JaS6miCa8i1B2h3joEONNSgyN/ahDdP7x
// SIG // yRyv86x7mjtb9z8PdGA6bHyEKsjflJIcUAgWYjjz1oxP
// SIG // ckU3KFStNfMV2ZvGC4HCgbmZrGNorWhEybYdDPpTemHf
// SIG // P5e5iiFjdXLUWSoimcwnW5Ah28nB7Rxq0As7ljQ6/aov
// SIG // Lu3wc96RwEgQ9nIMnJWhggIdMIICGQYJKoZIhvcNAQkG
// SIG // MYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBAgphA9z2AAAAAAAMMAcGBSsOAwIaoF0wGAYJKoZI
// SIG // hvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUx
// SIG // DxcNMTEwNjEwMTgyNDQ1WjAjBgkqhkiG9w0BCQQxFgQU
// SIG // Hi6phwRHVGnNWIpvdKQApsws3gowDQYJKoZIhvcNAQEF
// SIG // BQAEggEAbdxjrdPPj4y+B4wJaiZSSBcq3CpqoYZVP2rm
// SIG // /e0udXbXuST4+kP6mEiF8ZnSKmQr3US2nvH+Vm7nPbDD
// SIG // nTW4DW55I2fSAB1eKE4TEy5ekFgtQw+sB5irUjRzCBbj
// SIG // kuS+MY4+hHbPrhaTV7rg+f3pccMS/QGKfegYzZ4VFC51
// SIG // EZ103y3CaTOg6EQljPj1LljfsGJY+/N61Y5gUPOWIdUy
// SIG // XgM0Eku96G7afbn22Yel7o6/OcVW4l4abIQ//ete1Qq2
// SIG // 5LYrPz+eejKrKzZIe7rLmz6BdVU/alhs+fh7oGDpmbp4
// SIG // iHeTjB6o8lc0gke9WPZqDabS9tmJ1O3MgXzweji4GQ==
// SIG // End signature block
