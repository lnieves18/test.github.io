var _navCourseNodes = new Array();
var _navCourseNodesById = new Array();
var _navCurrentCourseNode;
var _navPreviousCourseNode = null; // the last selected node

var _NAV_Status_None = 0;
var _NAV_Status_Incomplete = 1;
var _NAV_Status_Complete = 2;
var _NAV_Status_Current = 3;

var _NAV_Toggle_None = -1;
var _NAV_Toggle_Closed = 0;
var _NAV_Toggle_Open = 1;
var _bLessonEnabled = false;

var textPrevState = 4;
var thumbnailPrevState = 1;

var thumbnailView = 0;
var textView = 1;

var bthumbnailsLoaded = false;
var btextViewLoaded = false;

var mouseButton = 0;
var thumbnailUrl = "course/thumbnails/thumbnail.xml";
var VIEWER_SETTINGS_FILE = "settings/settings.xml"
var m_thumbnail = null;

var isResize=false;

//KeyCodes
var MOUSE_BUTTON_LEFT = 1;
var MOUSE_BUTTON_RIGHT = 2;
var ASCII_KEYCODE_ARROW_RIGHT = 39;
var ASCII_KEYCODE_ARROW_LEFT = 37;


//----------------------Detect Browser-----------------------------

var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},		
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	]
};
BrowserDetect.init();

//-----------------------------------------------------------------
function NavCourseNode(indexPos, parentNode, nodeIdentifier, nodeName, nodeUrl, nodeHasChildren)
{
    this.index = indexPos;
    this.parent = parentNode;
    this.identifier = nodeIdentifier;
    this.title = nodeName;
    this.hasChildren = nodeHasChildren;
    this.isOpen = (this.index == 0);
    this.status = _NAV_Status_None;
    this.isCurrent = false;
    this.url = nodeUrl;
    this.hasContent = nodeUrl != null && nodeUrl.length > 0;

    this.navControlId = "nav___" + this.identifier;
    this.navChildrenControlId = "navChildren___" + this.identifier;
    this.navStatusId = "navStatus___" + this.identifier;
    this.navToggleId = "navToggle___" + this.identifier;
}

function navLoad()
{
    try
    {
        onNavResize();
        navLoadTableOfContents();

        //
        //  Set localized text
        //
            //Check for branding
            
        var m_oViewerSettings = _navLoadXmlDoc(VIEWER_SETTINGS_FILE);
        var showBranding = m_oViewerSettings.selectSingleNode("//ShowBranding").getAttribute("value");
        if (showBranding == '1')
            document.getElementById("imgBranding").src = IMG_BRANDING;
        else
            document.getElementById("imgBranding").style.visibility = "hidden";
        document.getElementById("navTocToggleContainer").innerHTML = _navHighlightAccessKey(L_AccessKey_TableOfContents, L_LinkHtml_TableOfContents);
        document.getElementById("navTocToggleContainer").accessKey = L_AccessKey_TableOfContents;
        document.getElementById("navTocToggleContainer").title = L_ToolTip_HideTableOfContents;
        
        document.getElementById("navBack").accessKey = L_AccessKey_Previous;
        document.getElementById("navBack").title = L_ToolTip_Previous;
        
        document.getElementById("navNext").accessKey = L_AccessKey_Next;
        document.getElementById("navNext").title = L_ToolTip_Next;
        
        document.getElementById("navExit").innerHTML = _navHighlightAccessKey(L_AccessKey_Exit, L_LinkHtml_Exit);
        document.getElementById("navExit").accessKey = L_AccessKey_Exit;
        document.getElementById("navExit").title = L_ToolTip_Exit;

        document.getElementById("imgTOCRight").style.backgroundImage = "";  //"url( ' " + IMG_CONTENT1_NORMAL + "')";
        document.getElementById("navTocToggleContainer").style.backgroundImage = "";  //"url( ' " + IMG_CONTENT2_NORMAL + "')";
        document.getElementById("imgTOCLeft").style.backgroundImage = "";  //"url( ' " + IMG_CONTENT3_NORMAL + "')";
        
        document.getElementById("imgTextView").src = IMG_TOC_TEXTVIEW_BTN_SELECTED;
        document.getElementById("imgThumbnailView").src = IMG_TOC_THUMBNAILVIEW_BTN_NORMAL;
        document.getElementById("imgCloseButton").src = IMG_IMGCLOSEBUTTON_BTN_NORMAL;
            
        m_thumbnail = _navLoadXmlDoc(thumbnailUrl);
            
        if(m_thumbnail == null || m_thumbnail.xml == "")
            document.getElementById("imgThumbnailView").style.visibility = "hidden";
        else if(m_thumbnail.xml != "") 
            document.getElementById("imgThumbnailView").src = IMG_TOC_THUMBNAILVIEW_BTN_NORMAL;
        if(window.ActiveXObject)
        {
            document.getElementById("divSep").attachEvent("onmousedown",divSep_onmousedown );
            document.getElementById("divSep").attachEvent("onmouseup",divSep_onmouseup );
        }
        else{
            document.getElementById("divSep").addEventListener("mousedown",divSep_onmousedown, false );
            document.addEventListener("mouseup",divSep_onmouseup, false);
            document.addEventListener("mousemove",divSep_onmousemove, false);
        }
    }
    
    catch(e)
    {}
}

function navLoadTableOfContents()
{
    _navLoadXmlDoc("course/manifest2.xml");
}

function _navLoadXmlDoc(url)
{
    var xmlHttp, oXML;

    // try to use the native XML parser
    try
    {
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false); // Use syncronous communication
        xmlHttp.send(null);
        oXML = xmlHttp.responseXML;
    } 
    catch (e)
    {
        // can't use the native parser, use the ActiveX instead
        xmlHttp = getXMLObject();
        try{
            xmlHttp.async = false;   // Use syncronous communication
            xmlHttp.resolveExternals = false;
            xmlHttp.load(url);
            oXML = xmlHttp;
        }
        catch(e)
        {
            oXML = null;
            return oXML;
        }
    }
    if(textView == 1 && url != thumbnailUrl && url!=VIEWER_SETTINGS_FILE)
        _onNavTocXmlLoaded(oXML);
    else
     return oXML;
}

// get the best ActiveX object that can read XML
function getXMLObject()
{
    // create an array with the XML ActiveX versions
    var aVersions = new Array("Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.3.0");

    // loop through the array until we can create an activeX control
    for (var i = 0; i < aVersions.length; i++)
    {
        // return when we can create the activeX control
        try
        {
            var oXML = new ActiveXObject(aVersions[i]);
            return oXML;
        } 
        catch (e)
        {
        }
    }

    // could not create an activeX, return a null
    return null;
}

function _onNavTocXmlLoaded(xml)
{
    if(window.ActiveXObject)
    {
        xml.setProperty("SelectionNamespaces", "xmlns:ims='http://www.imsproject.org/xsd/imscp_rootv1p1p2'");
        xml.setProperty("SelectionLanguage", "XPath");
     }
    var xmlDefaultOrg = xml.documentElement.selectSingleNode("//ims:organizations/ims:organization[@identifier = parent::*/@default]");
    var title = xmlDefaultOrg.selectSingleNode("ims:title").text;

    document.getElementById("structTitle").appendChild(document.createTextNode(title));
    document.title = title;

    //Check if content is enabled at Lesson node
    var lessonComment = xml.documentElement.selectSingleNode("//comment()[. = 'LessonEnabled']");
    if (lessonComment != null)
        _bLessonEnabled = true;
        
    _navAddNavigationNodesFromXml(xml, null, xmlDefaultOrg.selectNodes("ims:item"));
}

function _navAddNavigationNodesFromXml(doc, parent, xmlNodes) 
{
    for(var i = 0; i < xmlNodes.length; i++)
    {
        var xmlNode = xmlNodes[i];
        //var xmlChildNodes = xmlNode.selectNodes("ims:item");
        var xmlChildNodes = xmlNode.selectNodes("*[local-name()='item']");
        
        var courseIndex = _navCourseNodes.length;
        var courseId = xmlNode.selectSingleNode("@identifier").text;
        var courseTitle = xmlNode.selectSingleNode("ims:title").text;
        //var courseTitle = xmlNode.selectSingleNode("*[local-name()='title]").text;
        var courseResourceRef = xmlNode.selectSingleNode("@identifierref").text;
        if(courseResourceRef)
            var courseUrl = doc.documentElement.selectSingleNode("//ims:resource[@identifier='" + courseResourceRef + "']/@href").text;
        //var courseUrl = doc.documentElement.selectSingleNode("//*[local-name()='resource' and @identifier='" + courseResourceRef + "']/@href").text;
        var hasChildren = (xmlChildNodes.length > 0);

        if(xmlNode.getAttribute("isvisible") != "false")
        {  
            var courseNode = new NavCourseNode(courseIndex, parent, courseId, courseTitle, courseUrl, hasChildren);

            _navCourseNodes[courseIndex] = courseNode;
            _navCourseNodesById[courseNode.identifier] = courseNode;


            //  Add to UI

            _navCreateNavigationControl(courseNode);

            //  Find child nodes

            _navAddNavigationNodesFromXml(doc, courseNode, xmlChildNodes);
        }
    }
    btextViewLoaded = true;
}

function _navAddNavigationNode(parent, name) 
{
    var div = document.createElement("div");

    div.appendChild(document.createTextNode(name));

    parent.appendChild(div);
}

function _navCreateNavigationControl(node)
{
    var doc = document;

    var parentControl;

    if (node.parent == null)
        parentControl = document.getElementById("textTreeView");
    else
        parentControl = document.getElementById(node.parent.navChildrenControlId);

    var ctrlDiv = doc.createElement("div");
    ctrlDiv.id = node.navControlId;
    switch(node.hasChildren)
    {
        case true: 
            if(node.parent == null)
            ctrlDiv.className = "tocModule"; 
            break;
        case false: ctrlDiv.className = "tocNode"; break;
    }

    var statusImg = doc.createElement("img");
    statusImg.id = node.navStatusId;
    statusImg.setAttribute("src", "images/node.gif");
    statusImg.className = "tocStatusImage";
    _navSetStatusImage(statusImg, node.status);
    
    ctrlDiv.appendChild(statusImg);

    var toggleAnchor = doc.createElement("a");
    toggleAnchor.setAttribute("href", "javascript: navToggleNode('" + node.identifier + "');");
    toggleAnchor.setAttribute("onmouseover", "window.status=' '; return true");
    toggleAnchor.setAttribute("onmouseout", "window.status=' '; return true");
    ctrlDiv.appendChild(toggleAnchor);

    var toggleImg = doc.createElement("img");
    toggleImg.id = node.navToggleId;
    if(node.hasChildren == false)
    {
        toggleImg.className = "tocToggleImageChild";
    }
    else
        toggleImg.className = "tocToggleImage";
    _navSetToggleImageByNode(toggleImg, node);
    toggleAnchor.appendChild(toggleImg);

    var labelAnchor = doc.createElement("a");
    labelAnchor.appendChild(doc.createTextNode(node.title));
    
    if(node.url != "default.html#")
    {   
        if (node.hasChildren == false)
        {
            labelAnchor.className = "tocTopicAnchor";
            ctrlDiv.className = "tocTopic";
            labelAnchor.setAttribute("href", "javascript:navMoveToNode('" + node.identifier + "')");
        }
        else
        {
            labelAnchor.className = "tocModuleAnchor";
            ctrlDiv.className = "tocModule";
            labelAnchor.setAttribute("href", "javascript:navMoveToNode('" + node.identifier + "')");
        }
    }
    else
    {
        labelAnchor.className = "tocNodeLessonAnchor";
        ctrlDiv.className = "tocNodeLesson";
        labelAnchor.setAttribute("href", "javascript: navToggleNode('" + node.identifier + "');");
    }
    labelAnchor.setAttribute("onmouseover", "window.status=' '; return true");
    labelAnchor.setAttribute("onmouseout", "window.status=' '; return true");
    ctrlDiv.appendChild(labelAnchor);

    parentControl.appendChild(ctrlDiv);
    ctrlDiv.title = ctrlDiv.innerText;
    if (node.hasChildren)
    {
        var childrenDiv = doc.createElement("div");
        childrenDiv.id = node.navChildrenControlId;
        childrenDiv.className = "tocChildContainer";
        /*childrenDiv.setAttribute("onclick", "javascript:navToggleNode('" + node.identifier + "');");*/
        childrenDiv.style.display = node.isOpen ? "block" : "none"
        
        parentControl.appendChild(childrenDiv);
    }
}

function navGetNode(id)
{
    return _navCourseNodesById[id];
}

function navGetParent(id)
{
    return _navCourseNodesById[id];
}

function navGetParentControl(id)
{
    var parent = navGetParent(id);

    if (parent == null)
        return null;
    else
        return document.getElementById(parent.navControlId);
}

function _navGetStatusImage(status)
{
    switch (status)
    {
        case _NAV_Status_None:
            return "images/node.gif"; 
        case _NAV_Status_Incomplete:
            return "images/node_incomplete.gif";
        case _NAV_Status_Complete:
            return "images/node_complete.gif";
        case _NAV_Status_Current:
            return "images/node_current.gif";
        default:
            return "images/node.gif";
    }
}
/*
function _navGetStatusText(status)
{
    switch (status)
    {
        case _NAV_Status_None:
            return L_Status_None;
        case _NAV_Status_Incomplete:
            return L_Status_Incomplete;
        case _NAV_Status_Complete:
            return L_Status_Complete;
        case _NAV_Status_Current:
            return L_Status_Current;
        default:
            return "";
    }
}
*/
function _navSetStatusImage(img, status)
{
    img.src = _navGetStatusImage(status);
    //img.alt = _navGetStatusText(status);
}

function _navSetStatusImageByNode(img, node)
{
    if(node.isCurrent == true)
        _navSetStatusImage(img, _NAV_Status_Current);
    else
    {    _navSetStatusImage(img, node.status);
    if(node.hasChildren == true && node.parent == null)
        document.getElementById(node.navControlId).className = "tocModule";
    else if (node.hasChildren == false && node.parent != null)
        document.getElementById(node.navControlId).className = "tocTopic";
    else if(node.hasChildren == true && node.parent !=null)
        document.getElementById(node.navControlId).className = "tocNodeLesson";
    }
    
    if (bthumbnailsLoaded)
    {
        UpdateThumbnailStatus(node.identifier, node.isCurrent);
    }
}
function _navGetToggleImageBullet(toggle)
{
    return "images/toc_bullet.gif";
}

function _navGetToggleImage(toggle)
{
    switch (toggle)
    {
        case _NAV_Toggle_Closed:
            return IMG_TOC_PLUS_NORMAL;
        case _NAV_Toggle_Open:
            return IMG_TOC_MINUS_NORMAL;
    }
}
/*
function _navGetToggleText(toggle)
{
    switch (toggle)
    {
        case _NAV_Toggle_Closed:
            return L_Toggle_Expand;
        case _NAV_Toggle_Open:
            return L_Toggle_Close;
        default:
            return "";
    }
}*/

function _navSetToggleImage(img, toggle,type)
{   
    if(type == "topic")
        img.src = _navGetToggleImageBullet(toggle);
    else
        img.src = _navGetToggleImage(toggle);
    //img.alt = _navGetToggleText(toggle);
}

function _navSetToggleImageByNode(img, node)
{
    if (node.hasChildren == false)
        _navSetToggleImage(img, _NAV_Toggle_None, "topic");
    else if (node.isOpen)
        _navSetToggleImage(img, _NAV_Toggle_Open, "");
    else
        _navSetToggleImage(img, _NAV_Toggle_Closed, "");
}

function navOpenHierarchy(node)
{
    if(node != null)
    {
        navOpenNode(node.identifier);
        navOpenHierarchy(node.parent);
    }
}

function navOpenNode(id)
{
    var node = navGetNode(id);

        if (node.isOpen == false)
    {
        node.isOpen = true;
        _onNavToggleStateChanged(node);
    }
}

function navCloseNode(id)
{
    var node = navGetNode(id);

    if (node.hasChildren == true && node.isOpen == true)
    {
        node.isOpen = false;
        _onNavToggleStateChanged(node);
    }else
    {
        if(node.parent!=null)
            document.getElementById(node.parent.navChildrenControlId).style.display = "block";
    }
}

function navToggleNode(id)
{
    var node = navGetNode(id);

    if (node.isOpen == true)
        navCloseNode(id);
    else
        navOpenNode(id);
}

function _onNavToggleStateChanged(node)
{
    _navSetToggleImageByNode(document.getElementById(node.navToggleId), node);
    if(document.getElementById(node.navChildrenControlId)!=null)
        document.getElementById(node.navChildrenControlId).style.display = node.isOpen ? "block" : "none";
    if(node.parent!=null)
        document.getElementById(node.parent.navChildrenControlId).style.display = "block";
}

function _onNavStatusChanged(node)
{
    _navSetStatusImageByNode(document.getElementById(node.navStatusId), node)
}

function navMoveToIndex(index)
{
    var newNodeIndex = index;
    var done = false;
	
	// we are about to change the selected node, remember that we selected this node last
	_navPreviousCourseNode = _navCurrentCourseNode;
    
    if(_navCurrentCourseNode != null)
    {   
        _navCurrentCourseNode.isCurrent = false;
        _onNavLeaveNode(_navCurrentCourseNode);
        _navCurrentCourseNode = null;
    }

    while(!done)
    {
        if(newNodeIndex >= _navCourseNodes.length)
        {
            navMoveToLast();
            return;
        }
        else if(!_navCourseNodes[newNodeIndex].hasContent && !(_navCourseNodes[newNodeIndex].url == "default.html#"))
        {
            newNodeIndex++;
        }
        else
        {
            done = true;
        }
    }
    
    _navCurrentCourseNode = _navCourseNodes[newNodeIndex];
    _navCurrentCourseNode.isCurrent = true;
    _onNavEnterNode(_navCurrentCourseNode);
	
	// remember the bookmark
	setBookmark(newNodeIndex + "");
}

function _onNavLeaveNode(node)
{
    _onNavStatusChanged(node);
}


function _onNavEnterNode(node)
{
    if(node.status == _NAV_Status_None)
        node.status = _NAV_Status_Incomplete;
        
    _onNavStatusChanged(node);
    navOpenHierarchy(node);
    if(node.parent == null)
        document.getElementById(node.navControlId).className = "tocModuleSelected";
    else if (node.hasChildren == false)
        document.getElementById(node.navControlId).className = "tocTopicSelected";
    else if(node.hasChildren == true && node.parent != null)
        document.getElementById(node.navControlId).className = "tocModuleSelected";    
    _onNavMakeVisible(document.getElementById(node.navControlId));

    document.getElementById("navBackContainer").className = (node.index == 0) ? "disabled" : "";
    document.getElementById("navNextContainer").className = (node.index == _navCourseNodes.length - 1) ? "disabled" : "";
    
    if (bthumbnailsLoaded)
    {
        UpdateThumbnailStatus(node.identifier, node.isCurrent);
    }

	// load a blank page in the course frame
	document.getElementById("structContent").src = "about:blank";
	
    // user a 1 millesecond time out to set the actual content page, we do this to make sure we get an onload event in the content page
	// the user of named anchors in the page supresses the onload event.
	setTimeout("document.getElementById('structContent').src = 'course/' + _navCurrentCourseNode.url",1);
	
	//alert("status:" + _navCurrentCourseNode.status);
}

function _onNavMakeVisible(ctrl)
{
/*    var tocCtrl = document.getElementById("structToc");

    if (ctrl.offsetTop < tocCtrl.clientTop)
        ctrl.scrollIntoView(true);
    else if (ctrl.offsetTop + ctrl.offsetHeight > tocCtrl.clientTop + tocCtrl.clientHeight)
        ctrl.scollIntoView(false);*/
}

function navMoveToFirst()
{
    navMoveToIndex(0);
}

function navMoveToLast()
{
    var done = false;
    var newNodeIndex = _navCourseNodes.length - 1;
    
    while(!done)
    {
        if(newNodeIndex < 0)
        {
            return; // We must not have any content!;
        }
        else if(_navCourseNodes[newNodeIndex].hasContent)
        {
            done = true;
        }
        else
        {
            newNodeIndex--;
        }
    }
    
    navMoveToIndex(newNodeIndex);
}

function navMoveNext()
{
    var done = false;
    var newNodeIndex;
    
    if(_navCurrentCourseNode == null)
    {
        return;
    }

    newNodeIndex = _navCurrentCourseNode.index + 1;  
    
    while(!done)
    {
        if(newNodeIndex > _navCourseNodes.length-1)
        {
            return; // We must not have any content!;
        }
        else if(_navCourseNodes[newNodeIndex].hasContent != null && !(_navCourseNodes[newNodeIndex].url == "default.html#"))
        {
            done = true;
        }
        else
        {
            newNodeIndex++;
        }
    }
    
    navMoveToIndex(newNodeIndex);
}

function navExitPage()
{
    var success = termSCO();
    var win = window;
    if(win.frameElement != null)
    {
        while(win.frameElement != null)
        {
            win = win.parent;
        }
    }
    if(BrowserDetect.browser != "Explorer")
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserWrite");
    win.close();
}

function navMovePrevious()
{
    var done = false;
    var newNodeIndex;

    if(_navCurrentCourseNode == null)
    {
        return;
    }
    
    newNodeIndex = _navCurrentCourseNode.index - 1;
    
    while(!done)
    {
        if(newNodeIndex < 0)
        {
            return; // We must not have any content!;
        }
        else if(_navCourseNodes[newNodeIndex].hasContent && !(_navCourseNodes[newNodeIndex].url == "default.html#"))
        {
            done = true;
        }
        else
        {
            newNodeIndex--;
        }
    }
    
    navMoveToIndex(newNodeIndex);
}

function navMoveToNode(id)
{
    navMoveToIndex(_navCourseNodesById[id].index);
}

function navToggleToc()
{
    var container = document.getElementById("navTocToggleContainer");
    var tocCell = document.getElementById("structCellToc");
    var toggle = document.getElementById("TOC_Container");
    var separator = document.getElementById("structTOCResize");

    if (container.className == "navTocOpen")
    {
        container.className = "navTocClosed";
        tocCell.style.display = "none";
        toggle.style.display = "none";
        separator.style.display = "none";
        container.title = L_ToolTip_ShowTableOfContents;

        if(BrowserDetect.browser == "Firefox")
        {
            document.getElementById("tdTOC").style.width="0%";
            document.getElementById("divSep").style.width="0%";
            document.getElementById("structCellContent").style.width = "100%";
            document.getElementById("structContent").style.width = "100%";//document.getElementById("structCellContent").style.width + "px";
        }        
        document.getElementById("imgTOCRight").style.backgroundImage = "url( ' " + IMG_CONTENT1_NORMAL + "')";
        document.getElementById("imgTOCLeft").style.backgroundImage = "url( ' " + IMG_CONTENT3_NORMAL + "')";
        document.getElementById("navTocToggleContainer").style.backgroundImage = "url( ' " + IMG_CONTENT2_NORMAL + "')";
        
    }
    else
    {
        container.className = "navTocOpen";
        tocCell.style.display = "block";
        toggle.style.display = "block";
        separator.style.display = "block";
        container.title = L_ToolTip_ShowTableOfContents;
        
        
        document.getElementById("imgTOCRight").style.backgroundImage = "";
        document.getElementById("imgTOCLeft").style.backgroundImage = "";
        document.getElementById("navTocToggleContainer").style.backgroundImage = "";
    }

    onNavResize();
}

function onNavResize()
{
    var minWidth = 400;
    var minHeight = 300;

    var height = document.body.clientHeight - 101;
    var width = document.body.clientWidth;
    var tocWidth = document.getElementById("structCellToc").style.display == "none" ? 0 : 201;

    var ver = getInternetExplorerVersion();

    if (width < minWidth)
    {
        width = minWidth;
    }

    if (height < minHeight)
    {
        height = minHeight;
    }

    if(BrowserDetect.browser == "Firefox")
    {
        document.getElementById("structRowContent").style.height = height - 10 +"px";//"80%";
        document.getElementById("structCellToc").style.height = height - 32 + "px";
        document.getElementById("textTreeView").style.height = height - 32 + "px";
        document.getElementById("thumbnailView").style.height = height - 32 + "px";
        
        document.getElementById("structCellContent").style.height = height - 10 + "px";
        document.getElementById("structContent").style.height = height - 10 + "px";
        
        //document.getElementById("tdExit").style.paddingRight = "50px";
        var container = document.getElementById("navTocToggleContainer");
        if (container.className == "navTocOpen")
        {
            document.getElementById("structContent").style.width = width - 150 + "px";//217
        }
        document.getElementById("divSep").style.left = document.getElementById("structCellToc").style.width +"px";
        document.getElementById("structTOCResize").style.width = "6px";
        document.getElementById("structTOCResize").style.height= height - 200 + "px";//"270px"; 
        if(width < 700)
            document.getElementById("navExit").style.marginLeft = '625px';
        else
            document.getElementById("navExit").style.marginLeft = '90%';
            
        document.getElementById("structRowBottomNav").style.position = "relative";
         return;
    }
    if (ver != -1 && ver <= 6)
    {
        document.getElementById("structCellContent").style.pixelWidth = width - tocWidth - 22;
        document.getElementById("structContent").style.pixelWidth = width - tocWidth - 22;
        
        document.getElementById("structRowContent").style.pixelHeight =  height - 10;
        document.getElementById("structRowContent").style.pixelWidth = width - 12;
        
        document.getElementById("structCellContent").style.pixelHeight = height - 10;
        
        document.getElementById("structCellToc").style.pixelHeight = height - 15;
        document.getElementById("structContent").style.pixelHeight = height - 10;
        
        document.getElementById("textTreeView").style.pixelHeight = height - 31;
        document.getElementById("thumbnailView").style.pixelHeight = height - 31;
        
        if(width < 700)
            document.getElementById("navExit").style.marginLeft = '625px';
        else
            document.getElementById("navExit").style.marginLeft = '90%';
        
        if (document.getElementById("structTocResize").style.left > "0px")
        {
            document.getElementById("textTreeView").style.width = document.getElementById("structTocResize").style.left;
            document.getElementById("thumbnailView").style.width = document.getElementById("structTocResize").style.left;
        }
        else
        {
            document.getElementById("textTreeView").style.pixelWidth = 200 ;
            document.getElementById("thumbnailView").style.pixelWidth = 200;
        }
        document.getElementById("structTOCResize").style.pixelHeight = height - 208;
        
        document.getElementById("structCellContent").style.position = "fixed";
        document.getElementById("structCellToc").style.position = "absolute";
    }
    else{
        document.getElementById("structRowContent").style.pixelHeight = height - 3;
        document.getElementById("structCellToc").style.pixelHeight = height - 20;
        document.getElementById("structContent").style.pixelHeight = height - 10;
        
        document.getElementById("structCellContent").style.pixelWidth = width - tocWidth - 20;
        document.getElementById("structContent").style.pixelWidth = width - tocWidth - 20;
        document.getElementById("structRowContent").style.pixelWidth = width - 12;
        document.getElementById("structCellContent").style.pixelHeight = height - 10 ;
        document.getElementById("textTreeView").style.pixelHeight = height - 25;
        document.getElementById("thumbnailView").style.pixelHeight = height - 25;
        if(width < 700)
            document.getElementById("navExit").style.marginLeft = '625px';
        else
            document.getElementById("navExit").style.marginLeft = '90%';
        if (document.getElementById("structTOCResize").style.left > "0px")
        {
            document.getElementById("textTreeView").style.width = document.getElementById("structTocResize").style.left;
            document.getElementById("thumbnailView").style.width = document.getElementById("structTocResize").style.left;
        }
        else
        {
            document.getElementById("textTreeView").style.pixelWidth = 200;
            document.getElementById("thumbnailView").style.pixelWidth = 200;
        }
        document.getElementById("structTOCResize").style.pixelHeight = height - 195;
    }
    
    document.getElementById("structTOCResize").style.pixelWidth = 6;

    onNavContentFrameLoad();
}

function onNavContentFrameLoad()
{
    /*var frame = document.getElementById("structContent");
    
    if (frame.document && frame.document.body.offsetHeight)
    {
        frame.style.pixelHeight = frame.document.body.offsetHeight + 16;
    }*/
}

// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser)
function getInternetExplorerVersion()
{
    var rv = -1; // Return value assumes failure
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

function _navHighlightAccessKey(strKey, strHtml)
{
    var indexLower = strHtml.indexOf(strKey.toLowerCase());
    var indexUpper = strHtml.indexOf(strKey.toUpperCase());
    var indexPreferred = -1;

    if (indexLower > -1 && indexUpper > -1)
    {
        if (indexUpper < indexLower)
            indexPreferred = indexUpper;
        else
            indexPreferred = indexLower;
    }
    else if (indexUpper > -1)
    {
        indexPreferred = indexUpper;
    }
    else if (indexLower > -1)
    {
        indexPreferred = indexLower;
    }

    if (indexPreferred > -1)
    {
        return strHtml.substr(0, indexPreferred) + "<u>" + strHtml.substr(indexPreferred, 1) + "</u>" + strHtml.substr(indexPreferred + 1);
    }
    else
    {
        return strHtml;
    }
    
}

function TextViewStateChange(event)
{
    if(textPrevState!=4) {
    switch(event.type)
    {
    case "mousedown": document.getElementById("imgTextView").src = IMG_TOC_TEXTVIEW_BTN_DOWN;
                        textPrevState = 3;
    break;
    case "mouseup": document.getElementById("imgTextView").src = IMG_TOC_TEXTVIEW_BTN_SELECTED;
    textPrevState = 4; 
    document.getElementById("imgThumbnailView").src = IMG_TOC_THUMBNAILVIEW_BTN_NORMAL; thumbnailPrevState = 1;
    break;
    case "mouseover" : document.getElementById("imgTextView").src = IMG_TOC_TEXTVIEW_BTN_RO;
    textPrevState = 2;
    break;
    case "mouseout": document.getElementById("imgTextView").src = IMG_TOC_TEXTVIEW_BTN_NORMAL;
    textPrevState = 1; break;
    }}
}

function ThumbnailViewStateChange(event)
{
        if(thumbnailPrevState!=4) {
        switch(event.type)
        {
            case "mousedown": document.getElementById("imgThumbnailView").src = IMG_TOC_THUMBNAILVIEW_BTN_DOWN;
                              thumbnailPrevState = 3;
                              break;
            case "mouseup":   document.getElementById("imgThumbnailView").src = IMG_TOC_THUMBNAILVIEW_BTN_SELECTED;
                              thumbnailPrevState = 4;
                              document.getElementById("imgTextView").src = IMG_TOC_TEXTVIEW_BTN_NORMAL; textPrevState = 1;
                              break;
            case "mouseover" : document.getElementById("imgThumbnailView").src = IMG_TOC_THUMBNAILVIEW_BTN_RO;
                               thumbnailPrevState = 1;
                                break;
        case "mouseout": document.getElementById("imgThumbnailView").src = IMG_TOC_THUMBNAILVIEW_BTN_NORMAL;
        thumbnailPrevState = 2; break;
        }}
}

function ThumbnailLoad()
{
    var tabCount = 0;
    try
    {    
        var thumbnailViewDiv = document.getElementById("thumbnailView");
        var currentNodeId = null;
        
        document.getElementById("textTreeView").style.display = "none";
        document.getElementById("thumbnailView").style.display = "block";
        thumbnailView = 1;
        textView = 0;
        
        if (!bthumbnailsLoaded)
        {
            var xml = _navLoadXmlDoc("course/thumbnails/thumbnail.xml");
            
            var courseDirIndex =  document.location.href.indexOf("default.htm");
            var COURSE_DIR_Path = document.location.href.substring(0,courseDirIndex);
            
            var thumbnailNode = null;
            var itemId =null;
            var itemTitle = null;
            var imgSrc = null;
            var itemUrl = null;
            var nodeType = null;
            var itemTable = null;
            var IMG_PATH = COURSE_DIR_Path + "course/";
            
            for(var itemCount = 0; itemCount < _navCourseNodes.length; itemCount++)
            {
                itemId = _navCourseNodes[itemCount].identifier;
                itemTitle = _navCourseNodes[itemCount].title;
                
                thumbnailNode = xml.selectSingleNode("//Thumbnail[@id='" + itemId + "']");
                //if image exists,create am image element for it
                if(thumbnailNode)
                {
                    nodeType = thumbnailNode.getAttribute("type"); 
                    //for module/topic nodes
                    if (nodeType != "Lesson" || (nodeType == "Lesson" && _bLessonEnabled ))
                    {
                        imgSrc = thumbnailNode.getAttribute("uri"); 
                    }
                    else
                    {
                        imgSrc = "";
                    }
                    
                     //table contaning the status img & thumbnail
                    itemTable = document.createElement("table");
                    itemTable.id = itemId;
                    itemTable.border = '0';
                    itemTable.setAttribute("width", "100%");
                    var itemTr = document.createElement("tr" );
                    itemTr.id = "tr_" + itemId;
                    var itemThumbnailTd = document.createElement("td");
                    itemThumbnailTd.id = "thumbnail_" + itemId;
                    itemThumbnailTd.className = "thumbnailsBgr";
                    itemThumbnailTd.align = "center";
                    itemThumbnailTd.style.backgroundColor = '#D7E7FF';
                 
                    //create a div for each thumbnail -lesson node thumbnails will not be clickable
                    if (nodeType != "Lesson" || (nodeType == "Lesson" && _bLessonEnabled))
                    {
                        tabCount++;
                        var imgDiv = document.createElement("div" );
                        imgDiv.align = "center";
                        imgDiv.id = "imgDiv_" + itemId;
                        imgDiv.setAttribute("onmouseover", "setThumbnailStyle(this,event);");
                        imgDiv.setAttribute("onmouseout", "setThumbnailStyle(this,event);")
                        imgDiv.setAttribute("onclick", "loadTopic(this, event);");
                        imgDiv.setAttribute("onkeypress", "loadTopic(this, event);");
                        imgDiv.itemCount = itemCount;
                        imgDiv.tabIndex = tabCount;
                        imgDiv.title = _navCourseNodes[0].title;
                        imgDiv.className = "thumbnailsBgr";
                    }
                    else
                    {
                        itemThumbnailTd.style.cursor = "auto"; 
                        var imgDiv = document.createElement("div" );
                        imgDiv.align = "center";
                        imgDiv.id = "imgDiv_" + itemId;
                        imgDiv.title = _navCourseNodes[0].title;
                    }
                   
                    //image for each of the module/topic nodes
                    if (nodeType != "Lesson" || (nodeType == "Lesson" && _bLessonEnabled))
                    {
                        //create the image obj
                        imageObj = document.createElement("img");
                        imageObj.id = "img_" + itemId;
                        imageObj.src = IMG_PATH + imgSrc;
                            
                        if(imgSrc == "")
                        {
                            imageObj.setAttribute("height","50px;"); 
                        }
                        imgDiv.appendChild(imageObj); 
                    }
                    
                    //table contaning the status img & title
                    var statusTitleTable = document.createElement("table");
                    statusTitleTable.id = "tblStatusTitle_" + itemId;
                    statusTitleTable.width = "100%";
                    
                    var statusTitleTr = document.createElement("tr");
                    statusTitleTr.id = "trStatusTitle_" + itemId;
                    
                    var statusTd = document.createElement("td");
                    statusTd.id = "tdstatus_" + itemId;
                    statusTd.valign = "center";
                    
                    var titleTd = document.createElement("td");
                    titleTd.id = "tdtitle_" + itemId;
                    
                    var titleDiv = document.createElement("div");
                    
                    //item title div
                    titleDiv.innerHTML = itemTitle;
                    if(nodeType == "Lesson" && !_bLessonEnabled)
                    {
                        titleDiv.setAttribute("class" ,"topicTitle lessonTitle");
                    }
                    else
                    {
                        titleDiv.setAttribute("class" ,"topicTitle");
                    }
                    
                    titleTd.appendChild(titleDiv);
                    statusTitleTr.appendChild(statusTd);
                    statusTitleTr.appendChild(titleTd);
                    statusTitleTable.appendChild(statusTitleTr);
                    
                    imgDiv.appendChild(statusTitleTable);
                    itemThumbnailTd.appendChild(imgDiv);
                    
                    if( _navCourseNodes[itemCount].isCurrent)
                    {
                        imgDiv.className = "thumbnailsSelected";
                    }
                    itemTr.appendChild(itemThumbnailTd);
                    itemTable.appendChild(itemTr); 
                    thumbnailViewDiv.appendChild(itemTable); 
                    
                    var thumbnailDivider = document.createElement("div");
                    thumbnailDivider.id = "divider_" + itemId;
                    thumbnailDivider.className = "thumbnail_Divider";
                    thumbnailViewDiv.appendChild(thumbnailDivider); 
                }
            }
            thumbnailViewDiv.outerHTML = thumbnailViewDiv.outerHTML + "</Div>";
            bthumbnailsLoaded = true;
        }
        //resize images according to cuurent TOC width
        var currentTOCWidth = document.getElementById("TOCHeader").offsetWidth; 
        resizeThumbnails(currentTOCWidth,"onLoad");
    }
    catch(e)
    {
    }
}


function UpdateThumbnailStatus(sID,bisCurrent)
{
    try
    {
        var currentThumbnail_sID = "imgDiv_" + sID;
        
        if(bisCurrent)
        {
            document.getElementById(currentThumbnail_sID).className = "thumbnailsSelected";
        }
        else
        {
            document.getElementById(currentThumbnail_sID).className = "thumbnailsBgr";
        }
    }
    catch(e)
    {
    }
}

function resizeThumbnails(currentTOCWidth,evType)
{
    try
    {
        var thumbnail_window_perc = 80;
        var imgObj = null;
        var newThumbnailWidth = (thumbnail_window_perc * currentTOCWidth) / 100;
        var newThumbnailHeight = newThumbnailWidth * 0.8;
        if(evType == "onLoad" || "onResize")
        {        
            var thumbnailsCollection = document.getElementById("thumbnailView").getElementsByTagName("img");
        }
        for(var imgCount = 0; imgCount <thumbnailsCollection.length;imgCount++)
        {
           imgObj = thumbnailsCollection[imgCount];
           imgObj.width = newThumbnailWidth;
           imgObj.height = newThumbnailHeight;
        }
    }
    catch(e)
    {
    }
}
function TextViewLoad()
{
    try
    {
        document.getElementById("textTreeView").style.display = "block";
        document.getElementById("thumbnailView").style.display = "none";
        textView = 1;
        thumbnailView = 0 ;
    }
    catch(e)
    {
    }
}

function setThumbnailStyle(obj,event)
{   
    try
    {
        if(event.type == "mouseover" && obj.className != "thumbnailsSelected")
        {
            obj.className = "thumbnailHover";
        }
        else if (event.type == "mouseout" && obj.className != "thumbnailsSelected")
        {
            obj.className = "thumbnailsBgr";
        }  
    }
    catch(e)
    {
    }
}
function loadTopic(thumbnailNode, event)
{
    var evt= event || window.event;
    if (event.keyCode == '0' || event.keyCode == '13' || evt.which == '1' || evt.which == '13')
    {
        var itemIndex = thumbnailNode.itemCount; 
        navMoveToIndex(itemIndex);
    }
}


//--------------------------------------------------------------------
// Function: divSep_onmouseup
//
// Purpose:
//
//
//
// Parameters: None
//
// Returns: None
//--------------------------------------------------------------------
function divSep_onmouseup(event)
{   
    isResize= false;
    if(window.ActiveXObject)
        divSep.releaseCapture();
    else
    {
        mouseButton=0;
        document.getElementById("divSep").removeEventListener("mousemove",divSep_onmousemove,false);
    }
}

//--------------------------------------------------------------------
// Function: divSep_onmousedown
//
// Purpose:
//
//
//
// Parameters: None
//
// Returns: None
//--------------------------------------------------------------------
function divSep_onmousedown(event)
{
    isResize= true;
    if(window.ActiveXObject)
        divSep.setCapture();
    else
        document.getElementById("divSep").addEventListener("mousemove",divSep_onmousemove,false);
}

//--------------------------------------------------------------------
// Function: divSep_onmousemove
//
// Purpose:
//
//
//
// Parameters: None
//
// Returns: None
//--------------------------------------------------------------------
function divSep_onmousemove(event) 
{
    var button = (window.ActiveXObject)?window.event.button:event.which;
    if(window.ActiveXObject)
    {
        if (event.button == 0)
            return;
	    if (event.button == MOUSE_BUTTON_LEFT)
	    {
		    if (document.dir == "rtl")
			    divSepMove(document.body.clientWidth - event.clientX);
		    else
			    divSepMove(event.clientX);
    			
		    var currentTOCWidth = document.getElementById("TOCHeader").offsetWidth;
		    resizeThumbnails(currentTOCWidth, "onResize");
	    }
	}
	else//for firefox
	{
	    if(isResize)
	    {
		    divSepMove(event.screenX);
		    var currentTOCWidth = document.getElementById("TOCHeader").offsetWidth;
		    resizeThumbnails(currentTOCWidth, "onResize");
        }
	}
}

//--------------------------------------------------------------------
// Function: divSepMove
//
// Purpose:
//
//
//
// Parameters:
//	evX [in] - 
//
// Returns: None
//--------------------------------------------------------------------
function divSepMove(evX)
{
    var oTocFrame= document.getElementById("TOC_Container");
    var oTocHeader = document.getElementById("TOCHeader");
    var ocellTOC = document.getElementById("structCellToc");
    var oContentFrame = document.getElementById("structContent");
    var oCellContentFrame = document.getElementById("structCellContent");
    var oSeparator = document.getElementById("structTOCResize");
    var oTextView = document.getElementById("textTreeView");
    var oThumbnailView = document.getElementById("thumbnailView");
  
	var oTocFrameStyle = oTocFrame.style;
	var nDivSepWidth = oSeparator.clientWidth;
	var nDocBodyWidth = document.body.clientWidth;
	var minWidthPerc = 12.7; //for 100x100 image
	var maxWidthPerc = 60; //for 500x400 image
	var minTocWidth = (minWidthPerc* nDocBodyWidth)/100;
	var maxTocWidthPerc = (maxWidthPerc * nDocBodyWidth) / 100;
	var maxTocWidth = maxTocWidthPerc;


	 if(evX > minTocWidth && evX < maxTocWidth )
	{
       oTocFrame.style.width = evX+'px';
       oTocHeader.style.width= evX+'px';
       oTextView.style.width = evX+'px';
       for(var count = 0; count < oThumbnailView.getElementsByTagName("IMG").length; count++)
       {
            oThumbnailView.getElementsByTagName("IMG")[count].width = evX;
       }
       oThumbnailView.style.width = evX+'px';
       ocellTOC.style.width= evX+'px';
       oSeparator.style.left = evX + 1+'px';
       oContentFrame.style.left= evX+6+'px';
       oContentFrame.style.width  = document.body.clientWidth - evX - 18 +'px';
       oCellContentFrame.style.left= evX+6+'px';
       oCellContentFrame.style.width  = document.body.clientWidth - evX - 18 +'px';
       
       //return;

	}
}
function buttonOver()
{
    if (document.getElementById("navTocToggleContainer").className == "navTocClosed")
    {
        document.getElementById("imgTOCRight").style.backgroundImage = "url( ' " + IMG_CONTENT1_RO + "')";
        document.getElementById("navTocToggleContainer").style.backgroundImage = "url( ' " + IMG_CONTENT2_RO + "')";
        document.getElementById("imgTOCLeft").style.backgroundImage = "url( ' " + IMG_CONTENT3_RO + "')";       
        
     }
}

function buttonOut()
{
    var container = document.getElementById("navTocToggleContainer");

    if (container.className == "navTocClosed")
    {
        document.getElementById("imgTOCRight").style.backgroundImage = "url( ' " + IMG_CONTENT1_NORMAL + "')";
        document.getElementById("imgTOCLeft").style.backgroundImage = "url( ' " + IMG_CONTENT3_NORMAL + "')";
        document.getElementById("navTocToggleContainer").style.backgroundImage = "url( ' " + IMG_CONTENT2_NORMAL + "')";
    }
}
function keypress(event, obj)
{
    switch(event.which || event.keyCode)
    {
        case 99: navToggleToc();
                 break;
                 
        case 101: navExitPage();
                  break;
                  
        case 110: navMoveNext();
                  break;
                  
        case 112: navMovePrevious();
                  break;
    }
}

// SIG // Begin signature block
// SIG // MIIbDAYJKoZIhvcNAQcCoIIa/TCCGvkCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFIxF3ILIX9nS
// SIG // wAhF1XHh4zNN6+QwoIIV5zCCBIUwggNtoAMCAQICCmEI
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
// SIG // ARUwIwYJKoZIhvcNAQkEMRYEFPXxCtSnacWXso40LAos
// SIG // nWgldgSHMF4GCisGAQQBgjcCAQwxUDBOoCaAJABNAGkA
// SIG // YwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4AZ6Ek
// SIG // gCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVhcm5p
// SIG // bmcgMA0GCSqGSIb3DQEBAQUABIIBABTg4XpxqC/D2NcZ
// SIG // Onr2riNFxUW4nnPZwCGGO4bZXG32iS0QkrpRHKqbREG1
// SIG // 9Ywy78GIAdIQ3aUy8/rGG2H80YlyahZ+9yDbBV5iTOPA
// SIG // V2s9p7C4CDuXp6sSKdXr9TEvBkuwfbCIND6fZgVghiqu
// SIG // 0WUY4aodLSwWdEab4hr3uu3t9EjJXtOHws1qEcmUpXaQ
// SIG // Yu+UO4ZiSCJ+rjo8PBc0LENj5pWYJ/NiS3PFHOglENTJ
// SIG // 6a6P9NNu4FFdDSDNYU/juGKD4NuOK188k3aqdD8/S47y
// SIG // w0G/I1IWO9EPwDP/7VFi1+sXAQWldoiY8n5BhVikK5Qq
// SIG // B1BFTZlDfEE4CpDyMuyhggIdMIICGQYJKoZIhvcNAQkG
// SIG // MYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBAgphA9z2AAAAAAAMMAcGBSsOAwIaoF0wGAYJKoZI
// SIG // hvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUx
// SIG // DxcNMTAxMTE2MTgzNTUzWjAjBgkqhkiG9w0BCQQxFgQU
// SIG // +FWKTC5jOgcazLkcJYfYq4kFHp4wDQYJKoZIhvcNAQEF
// SIG // BQAEggEAokLv95E9yKwpnP6EbBpVDn6Y2Lw+g8iLoN5L
// SIG // mf5WPosTvgrKi+wGdrNWdjf5H5jFfreDMbBEQhvwC7Zf
// SIG // 0OC2m4ZsQMKG4R/W5pL4qxb13QH0VAdNx5QeXObcJSx3
// SIG // xAQ+IC6JZhoJNFatMzD0cuEIgmkcvfrtOBlHy17m+INt
// SIG // VcOdfnm0Ywu1mU0wK/HV1J55uy1I63IFMmh4+ZqaqeZI
// SIG // Rm0mYuWW8LnKXXq2Z5XigdyTdb6LHgfEJI+wNcVxg9ar
// SIG // yk+XcG5OPi8twUoKX6sJfn+RxQDjp9nbjKbHAN/ugXTc
// SIG // Qvu+8HxDjrdIhWCg7BClu9W7BrXQMHiKeOSwub61/g==
// SIG // End signature block
