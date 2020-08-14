
// XML DOM object definition
function XmlDom() {
	if (window.ActiveXObject) {
		var arrSignatures = ["MSXML2.DOMDocument.7.0", "MSXML2.DOMDocument.6.0",
						"MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0",
						"MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument",
						"Microsoft.XmlDom"];
		for (var i=0; i < arrSignatures.length; i++) {
			try {
				var oXmlDom = new ActiveXObject(arrSignatures[i]);
				msXmlVersion = arrSignatures[i];

				oXmlDom.async = false;
				try {
					oXmlDom.setProperty("AllowXsltScript", true);
					oXmlDom.setProperty("AllowDocumentFunction", true);
					oXmlDom.resolveExternals = true;
				} catch(err) { }

				return oXmlDom;
			} catch (oError) {
				//ignore
			}
		}
		// "MSXML is not installed on your system."

    } else if (navigator.userAgent.indexOf('MSIE') < 0) {
        msXmlVersion = "";
		var oXmlDom = document.implementation.createDocument("","",null);
        oXmlDom.async=false;
		oXmlDom.parseError = {
			valueOf: function () { return this.errorCode; },
			toString: function () { return this.errorCode.toString() }
		};

		oXmlDom.__initError__();

		oXmlDom.addEventListener("load", function () {
			this.__checkForErrors__();
			this.__changeReadyState__(4);
		}, false);

		return oXmlDom;
	} else {
		throw new Error("Your browser doesn't support an XML DOM object.");
	}
}

// Make all XML namespaces selectable via xPath experssions.
function setSelectionNamespaces(oXmlDom) {

	var sNamespaces = "";

	for (var i = 0; i < oXmlDom.documentElement.attributes.length; i++) {
		var oAttrib = oXmlDom.documentElement.attributes(i);
		if (oAttrib.nodeName.indexOf("xmlns") != -1) {
			if (oAttrib.nodeName == "xmlns") {
				sNamespaces += "xmlns:dflt='" + oAttrib.nodeValue + "' ";
			} else {
				sNamespaces += oAttrib.nodeName + "='" + oAttrib.nodeValue + "' ";
			}
		}
	}

	// Set the property
	oXmlDom.setProperty("SelectionNamespaces", sNamespaces);
}

function RemoveComments(oXMLDOM)
{
    try{
	    var oComments = oXMLDOM.selectNodes("//comment()");
	    var oComment = null;
    	
	    //while (oComment = oComments.nextNode())
	    for(nodeCount=0;nodeCount < oComments.length;nodeCount++)
	    {
	        oComment = oComments[nodeCount];
		    var oParent = oComment.parentNode;
		    oParent.removeChild(oComment);
	    }
    }catch(ex)
    {}
}

// extend DOM compliant browsers to mimic IE XML methods
if (navigator.userAgent.indexOf('MSIE') < 0) {	// if the browsers support this DOM2 interface

	Document.prototype.readyState = 0;
	Document.prototype.onreadystatechange = null;

	Document.prototype.__changeReadyState__ = function (iReadyState) {
	    try{
		this.readyState = iReadyState;
		}catch(e){}

		if (typeof this.onreadystatechange == "function") {
			this.onreadystatechange();
		}
	};

	Document.prototype.__initError__ = function () {
		this.parseError.errorCode = 0;
		this.parseError.filepos = -1;
		this.parseError.line = -1;
		this.parseError.linepos = -1;
		this.parseError.reason = null;
		this.parseError.srcText = null;
		this.parseError.url = null;
	};

	Document.prototype.__checkForErrors__ = function () {

		if (this.documentElement.tagName == "parsererror") {

			var reError = />([\s\S]*?)Location:([\s\S]*?)Line Number (\d+), Column (\d+):<sourcetext>([\s\S]*?)(?:\-*\^)/;

			reError.test(this.xml);

			this.parseError.errorCode = -999999;
			this.parseError.reason = RegExp.$1;
			this.parseError.url = RegExp.$2;
			this.parseError.line = parseInt(RegExp.$3);
			this.parseError.linepos = parseInt(RegExp.$4);
			this.parseError.srcText = RegExp.$5;
		}
	};

	Document.prototype.loadXML = function (sXml) {

		this.__initError__();
		this.__changeReadyState__(1);

		var oParser = new DOMParser();
		var oXmlDom = oParser.parseFromString(sXml, "text/xml");

		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}

		for (var i=0; i < oXmlDom.childNodes.length; i++) {
			var oNewNode = this.importNode(oXmlDom.childNodes[i], true);
			this.appendChild(oNewNode);
		}

		this.__checkForErrors__();
		this.__changeReadyState__(4);
	};

	Document.prototype.__load__ = Document.prototype.load;

	Document.prototype.load = function (sURL) {
		this.__initError__();
		this.__changeReadyState__(1);
		this.__load__(sURL);
	};

	Node.prototype.__defineGetter__("xml", function () {
		var oSerializer = new XMLSerializer();
		return oSerializer.serializeToString(this, "text/xml");
	});

    function nsResolver(sPrefix) {
        switch (sPrefix) {
            case "adlcp":
                return "http://www.adlnet.org/xsd/adlcp_rootv1p2";
                break;
            case "imsmd":
                return "http://www.imsglobal.org/xsd/imsmd_rootv1p2p1";
                break;
            case "xsi":
                return "http://www.imsproject.org/xsd/imscp_rootv1p1p2";
                break;
            default:
                return "http://www.imsproject.org/xsd/imscp_rootv1p1p2";
                break;
        }
    }
    // add IE style xPath support to DOM compliant browsers
    Node.prototype.selectNodes = function(sXPath) {
        var oEvaluator = new XPathEvaluator();
        var oResult = oEvaluator.evaluate(sXPath, this, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        var aNodes = new Array;

        if (oResult != null) {
            var oElement = oResult.iterateNext();
            while (oElement) {
                aNodes.push(oElement);
                oElement = oResult.iterateNext();
            }
        }
        return aNodes;
    };
    Node.prototype.selectSingleNode = function(sXPath) {
        var oEvaluator = new XPathEvaluator();
        var oResult = oEvaluator.evaluate(sXPath, this, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

        if (oResult != null) {
            return oResult.singleNodeValue;
        } else {
            return null;
        }
    };
    // add IE style xslt transformation to DOM compliant browsers
    Node.prototype.transformNode = function(oXslDom) {
        var oProcessor = new XSLTProcessor();
        oProcessor.importStylesheet(oXslDom);

        var oResultDom = oProcessor.transformToDocument(this);
        var sResult = oResultDom.xml;

        if (sResult.indexOf("<transformiix:result") > -1) {
            sResult = sResult.substring(sResult.indexOf(">") + 1, sResult.lastIndexOf("<"));
        }
        return sResult;
    };
    // add IE style xPath selection support to DOM compliant browsers
    Element.prototype.selectNodes = function(sXPath) {
        var oEvaluator = new XPathEvaluator();
        var oResult = oEvaluator.evaluate(sXPath, this, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

        var aNodes = new Array;

        if (oResult != null) {
            var oElement = oResult.iterateNext();
            while (oElement) {
                aNodes.push(oElement);
                oElement = oResult.iterateNext();
            }
        }
        return aNodes;
    };

    Node.prototype.__defineGetter__("nodeTypeString", function() {
        switch (this.nodeType) {
            case 3: return "text";
                break;
            default: return "text";
                break;
        }
    });
    Node.prototype.__defineGetter__("parentElement", function() {
        return this.parentNode;
    });
    Node.prototype.__defineGetter__("text", function() {
        return this.textContent;
    });

    Window.prototype.showModelessDialog = function(newWindowUri, dialogArguments, windowConfig) {
        var newWin = window.open(newWindowUri, "host", windowConfig.replace(/dialog/g, "").replace(/;/g, ",").replace(/:/g, "="), false);
        return newWin;
    };

    Node.prototype.__defineGetter__("parentElement", function() {
        return this.parentNode;
    });

    Node.prototype.__defineGetter__("innerText", function() {
        return this.textContent;
    });

    Node.prototype.__defineSetter__("innerText", function(textValue) {
        return this.textContent = textValue;
    });

    Node.prototype.__defineGetter__("nameProp", function() {
        return this.src.slice(-15);
    });

    HTMLElement.prototype.attachEvent = function(evt, evtHandler) {
        this.addEventListener(evt.slice(2), evtHandler, false);
    };

    Window.prototype.attachEvent = function(evt, evtHandler) {
        this.addEventListener(evt.slice(2), evtHandler, false);
    };


}
if (!document.importNode) {
	// add the importNode functionality to IE so that XML DOM elements can be appended to HTML DOM elements
	document.importNode = function(oNode, bImportChildren) {
		var oNew;

		// if the node is an element node
		if (oNode.nodeType == 1) {

			// Radio Buttons ONLY - don't work in IE (breaks FF).
			if (oNode.nodeName.toLowerCase() == "input" && oNode.getAttribute("type").toLowerCase() == "radio") {

				// Construct a string
				var radioButtonString = "<input ";
				for (var i = 0; i < oNode.attributes.length; i++) {
					radioButtonString += oNode.attributes[i].name.toLowerCase() + "=\"" + oNode.attributes[i].value + "\" ";
				}
				radioButtonString += "/>";

//				var radioButtonString = oNode.xml;

				// Specialized create element for radio buttons only.
				oNew = document.createElement(radioButtonString);

			} else {

				// create a new element based in the current document with the same name
				oNew = document.createElement(oNode.nodeName);
				// run through the attributes and clone them within this element
				for (var i = 0; i < oNode.attributes.length; i++) {
	//				if (oNode.attributes[i].value != null && oNode.attributes[i].value != '') {
						// If the attribute is an event handler, recreate the function tied to the event handler.
						if (oNode.attributes[i].name.toLowerCase().slice(0,2) == "on") {
							oNew[oNode.attributes[i].name.toLowerCase()] = new Function(oNode.attributes[i].value);
						// this fixes the ie bug of overlapping a javascript reserved word
						} else if (oNode.attributes[i].name == "class") {
							oNew.setAttribute("className", oNode.attributes[i].value);
						} else {
							oNew.setAttribute(oNode.attributes[i].name, oNode.attributes[i].value);
						}
	//				}
				}
				//oNew.style.cssText = oNode.style.cssText; - look into this - buggie

			}

		if (typeof oNew.attributes["frameborder"] != "undefined") {
			alert(oNew.getAttribute("frameborder"));
		}

		// if the node is a text node, create it and copy its value all in one operation
		} else if (oNode.nodeType == 3) {
			oNew = document.createTextNode(oNode.nodeValue);
		} else if (oNode.nodeType == 8) {
		// if the node is a comment node, create it and copy its value all in one operation
			oNew = document.createComment(oNode.nodeValue);
		}

		// if this function has been called with deep (importChildren) set to true, recursively call on children nodes
		if (bImportChildren && oNode.hasChildNodes()) {
			// recursively call this function for all children and append these children to the document tree
			for (var oChild = oNode.firstChild; oChild != null; oChild = oChild.nextSibling) {
				oNew.appendChild(document.importNode(oChild, true));
			}
		}
		return oNew;
	}
}

// peel through an HTML DOM and force flash objects to load if they aren't loaded yet
function refreshFlash(oNode) {
	// load all flash objects if they aren't loaded
	for (var x = 0; x < oNode.getElementsByTagName('object').length; x++) {
		// if the object is a flash object (if it has the LoadMovie function)
		if (typeof oNode.getElementsByTagName('object')[x].LoadMovie != "undefined") {
			// if the flash object is not loaded (on frame -1)
			if (oNode.getElementsByTagName('object')[x].frameNum == -1) {
				oNode.getElementsByTagName('object')[x].LoadMovie(0, oNode.getElementsByTagName('object')[x].getAttribute('data'));
			}
		}
	}
}

// peel through an HTML DOM and force flash objects to load if they aren't loaded yet
function reloadAllFlashNodes(oNode, bRefreshContentWheel) {

	if (typeof(bRefreshContentWheel) == "undefined") {
		bRefreshContentWheel = false;
	}

	// peel through all the object nodes in oNode
	for (var x = 0; x < oNode.getElementsByTagName('object').length; x++) {
		// if the object is a flash object
		if (oNode.getElementsByTagName('object')[x].getAttribute("type") == "application/x-shockwave-flash") {

			if (oNode.getElementsByTagName('object')[x].getAttribute("id") == "contentWheel" && bRefreshContentWheel == false) {
				return false;
			} else {
				// return the string of the currently selected object node
				var xmlString = xmlStringFromDocDom(oNode.getElementsByTagName('object')[x]);

				// do an innerHTML replacement of the contents of the Flash object's parent div
				oNode.getElementsByTagName('object')[x].parentNode.innerHTML = xmlString;
			}
		}
	}
	// If this method is directed to update the content wheel, then do so.
	if (bRefreshContentWheel == true) {
		updateContentWheel(bRefreshContentWheel);
	}
}

// peel through an HTML DOM and reload all elements with ECMAScript events using innerHTML.
function reloadAllEventNodes(oNode, bRefreshContentWheel) {
	// peel through all the object nodes in oNode
	for (var x = 0; x < oNode.getElementsByTagName('object').length; x++) {
		// if the object is a flash object
		if (oNode.getElementsByTagName('object')[x].getAttribute("type") == "application/x-shockwave-flash") {

			if (oNode.getElementsByTagName('object')[x].getAttribute("id") == "contentWheel" && bRefreshContentWheel == false) {
				return false;
			} else {
				// return the string of the currently selected object node
				var xmlString = xmlStringFromDocDom(oNode.getElementsByTagName('object')[x]);

				// do an innerHTML replacement of the contents of the Flash object's parent div
				oNode.getElementsByTagName('object')[x].parentNode.innerHTML = xmlString;
			}
		}
	}
}

// return the URI of the first xml-stylesheet processing instruction found in the XML DOM
function getXslt(xmlDom) {
	// extract the path to the first xml-stylesheet found within the xml doc
	for (var x = 0; x < xmlDom.childNodes.length; x++) {
		if (xmlDom.childNodes.item(x).nodeName == "xml-stylesheet") {
			// return the entire value string of the xml-stylesheet processing instruction
			var styleSheetValue = xmlDom.childNodes.item(x).nodeValue;
			// a regex pattern that matches the href attribute and value
			var reHref = /(?:href=".*")/i;
			var pMatch = styleSheetValue.match(reHref);
			// strip off the regex pattern and return the bare URI
			return pMatch[0].slice(6, -1);
		}
	}
	// no xml-stylesheet processing instruction was found
	return false;
}

// remove empty whitespace nodes from DOM (newlines and tabs within original document)
var notWhitespace = new RegExp(/\S/)
function cleanWhitespace(node) {
	// if node is undefined, make the default argument the current document's documentElement
	for (var x = 0; x < node.childNodes.length; x++) {
		var childNode = node.childNodes[x];
		if ((childNode.nodeType == 3) && (!notWhitespace.test(childNode.nodeValue))) {
			// that is, if it's a whitespace text node
			node.removeChild(node.childNodes[x]);
			x--;
		}
		if (childNode.nodeType == 1) {
			// elements can have text child nodes of their own
			cleanWhitespace(childNode);
		}
	}
}

// return an xml string that corresponds to the entered document fragment XML DOM
function xmlStringFromDocDom(oDocDom, encodeSingleSpaceTextNodes) {
	var xmlString = new String();

	// if the node is an element node
	if (oDocDom.nodeType == 1 && oDocDom.nodeName.slice(0,1) != "/") {
		// define the beginning of the root element and that element's name
		xmlString = "<" + oDocDom.nodeName.toLowerCase();

		// loop through all qualified attributes and enter them into the root element
		for (var x = 0; x < oDocDom.attributes.length; x++) {
			if (oDocDom.attributes[x].specified == true || oDocDom.attributes[x].name == "value") {	// IE wrongly puts unspecified attributes in here
				//if (oDocDom.attributes[x].name == "class") {
				//	xmlString += ' class="' + oNode.attributes[x].value + '"';
				//} else {

				// If this is not an input, then add the attribute is "input", then skip this.
				if (oDocDom.nodeName.toLowerCase() != "input" && oDocDom.attributes[x].name == "value" && oDocDom.attributes[x].specified == false) {

				// If this is an img element.
				} else if (oDocDom.nodeName.toLowerCase() == "img" && oDocDom.attributes[x].name == "width" ||
					oDocDom.nodeName.toLowerCase() == "img" && oDocDom.attributes[x].name == "height") {

				} else {

					xmlString += ' ' + oDocDom.attributes[x].name + '="' + oDocDom.attributes[x].value + '"';
				}
				//}
			}
		}

		// if the xml object doesn't have children, then represent it as a closed tag
//		if (oDocDom.childNodes.length == 0) {
//			xmlString += "/>"

//		} else {

		// if it does have children, then close the root tag
		xmlString += ">";
		// then peel through the children and apply recursively
		for (var i = 0; i < oDocDom.childNodes.length; i++) {
			xmlString += xmlStringFromDocDom(oDocDom.childNodes.item(i), encodeSingleSpaceTextNodes);
		}
		// add the final closing tag
		xmlString += "</" + oDocDom.nodeName.toLowerCase() + ">";
//		}

		return xmlString;

	} else if (oDocDom.nodeType == 3) {
		// return the text node value
		if (oDocDom.nodeValue == " " && encodeSingleSpaceTextNodes == true) {
			return "#160;";
		} else {
			return oDocDom.nodeValue;
		}
	} else {
		return "";
	}
}

// String representation of XML DOM.
function xmlString(xmlDom) {
	// During .xml IE turns single space whitespace nodes into \r\n\t{1,200}.
	var xmlDomString = xmlDom.xml;
	xmlDomString = xmlDomString.replace(/\r\n\t{1,200}/g, " ");
	xmlDomString = xmlDomString.replace(/#160;/g, " ");
	return xmlDomString;
}

// String representation of XML DOM.
function encodeSingleWhitespaceNodes(xmlDom) {
	// During .xml IE turns single space whitespace nodes into \r\n\t{1,200}.
	var xmlDomString = xmlDom.xml;
	xmlDomString = xmlDomString.replace(/\r\n\t{1,200}/g, "#160;");
	var encodedXml = new XmlDom();
	encodedXml.loadXML(xmlDomString);
	// Make sure not to lose xmlDom.url (which is used to determine absolute path for the document function in msxml3 xslt).
	xmlDom.replaceChild(encodedXml.documentElement, xmlDom.documentElement);
}


// SIG // Begin signature block
// SIG // MIIbDAYJKoZIhvcNAQcCoIIa/TCCGvkCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFDUM4APZWOd5
// SIG // fvAR1jsnJI/7BwwooIIV5zCCBIUwggNtoAMCAQICCmEI
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
// SIG // ARUwIwYJKoZIhvcNAQkEMRYEFBE5o8H0hBp0hrUJp9RE
// SIG // TknCfuqXMF4GCisGAQQBgjcCAQwxUDBOoCaAJABNAGkA
// SIG // YwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4AZ6Ek
// SIG // gCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVhcm5p
// SIG // bmcgMA0GCSqGSIb3DQEBAQUABIIBALvJvn1x4oKP9KNB
// SIG // oudQsKB0rG3mpYcmtUUy3v3tOU0hhsFlBrxASQ29Ba8z
// SIG // HKW+9THpRn8JPMB5p4GZi6r37Sx9XNvyDE+PtTkLU5Rm
// SIG // FIb8HjahC+0FVmGSW8kD7c44v6qwUvnKcjE2Tx6o1btf
// SIG // eY4pI96cb3xnDzRzisYLVr463JIBza4jY6aSmFyp4o3B
// SIG // SBdy15qHGMCOFudSigzTbb05ysD0bvFUJ8pSR7kpQRN5
// SIG // aFvZwoyEc1UKERAYvf5H2GjsXojPUCoCnMMCZSkxGKPO
// SIG // vViRvw2vqklo2UEmeYrqcNptkBL6VUk6cvpYP7+fxnH4
// SIG // yJsyfECwNYx83btNwpKhggIdMIICGQYJKoZIhvcNAQkG
// SIG // MYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBAgphBLP1AAAAAAANMAcGBSsOAwIaoF0wGAYJKoZI
// SIG // hvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUx
// SIG // DxcNMTAxMTEwMTc1MTAxWjAjBgkqhkiG9w0BCQQxFgQU
// SIG // t+S5rzwvav+yv1imPAjiaGjXbM0wDQYJKoZIhvcNAQEF
// SIG // BQAEggEAhjuTa3MqngbYTWHGKJOlvIYxEuv2nFlUwZlJ
// SIG // pyj/itebZy8r+wdzEUzSBJOVo36tR0UjGDkGgPZx6fwW
// SIG // c3nHpiO8oxiLL5WPI8DrU9lWlPbTpnyyg30JoU90uvS4
// SIG // RHj0NP7bs5O2BY4/BHcD3Xl7TxSpSZthjF6kxIQAEg98
// SIG // ZMHXvQdgEbroO21uhaCHX9IYbiO+e7oHuKQupxtdLv//
// SIG // vYjk4BFTCT8LppFkactlrsT43kLXOhRXJswDqwQ4cP0R
// SIG // m+BrQvQMWPKu4cHC6pNGF3WF0e5RqSyTm/ZCLBXSbM2w
// SIG // GETOOKCPJwCXxXXXQP05vubxzHVIzomwmU+EwutjFw==
// SIG // End signature block
