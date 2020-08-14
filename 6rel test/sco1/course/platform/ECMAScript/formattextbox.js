// Global Variables
var ELEMENT_B = "B";
var ELEMENT_BR = "BR";
var ELEMENT_EM = "EM";
var ELEMENT_I = "I";
var ELEMENT_P = "P";
var ELEMENT_STRONG = "STRONG";
var ELEMENT_U = "U";
var ELEMENT_A = "A";
var ELEMENT_UL = "UL";
var ELEMENT_LI = "LI"
var BULLET_UNICODE = "\u2022";
var _text;
var _textBlock;
var plugin;
var bold, italic, underline, link, bullet, lastElement;

// Parse the input (plain text) to valid Xml and Formats the text.
// Param1: Input Text
// Param2: Plugin canvas
// Param3: TextBlock object
function parseAndFormatText(text, plugin, textBlock)
{
    // Private Variables
    var xmlObj;
    var getChildNodesCount;
    var nameUpper;
    var objectNodeType;

    // Save the original text string
    _text = text;
    _textBlock = textBlock;

    this.plugin = plugin;
    
    // Wrap the input in a <div> (so even plain text becomes valid XML)
    var stringReader = "<div>" + _text + "</div>";

    // Read the input
    var objDOMDoc = new XmlDom();
    objDOMDoc.async = false;	    
    objDOMDoc.loadXML(stringReader);
        xmlObj = objDOMDoc.documentElement;
        getChildNodesCount = xmlObj.parentNode.childNodes[0].childNodes.length;
        
        // Assign the xml object to xml reader
        var xmlReader = xmlObj.parentNode.childNodes[0].childNodes;
        
        // Read the entire XML DOM...
        for(var nodesCount=0; nodesCount< getChildNodesCount; nodesCount++)
        {
            lastElement = ELEMENT_P;
                
            // Getting the nameUpper and objectNodeType
            nameUpper = xmlReader[nodesCount].nodeName.toUpperCase();
            objectNodeType = xmlReader[nodesCount].nodeTypeString;
            this.formatNodes(xmlReader[nodesCount], nodesCount, nameUpper, objectNodeType);
           
            // Read through child nodes
            var childNodesCount = xmlReader[nodesCount].childNodes.length;
            if(childNodesCount > 0)
            {
                var objChildNodes = xmlReader[nodesCount].childNodes;
                this.readChildNodes(objChildNodes, nodesCount, nameUpper, objectNodeType);
            }
        }
}

// Reads the child nodes of the xml. It calls the inner child node
// function if it has childnodes.
// Param1: Xml DOM object
// Param2: Node count
// Param3: Xml element
// Param4: Node type element
function readChildNodes(objChildNodes, nodesCount, nameUpper, objectNodeType)
{
    if(objChildNodes != null)
    {
        for(var readCount=0; readCount < objChildNodes.length; readCount++)
        {
            var objInnerChildNodes = objChildNodes[readCount];
            this.formatChildNode(objInnerChildNodes, nodesCount, nameUpper, objectNodeType);
            
            if(objInnerChildNodes.hasChildNodes)
            {
                this.readInnerChildNodes(objInnerChildNodes, nodesCount, nameUpper, objectNodeType);
            }
        }
    }
}

// Reads the inner child nodes of the xml. This function called
// recursively until it has no child nodes.
// Param1: Xml DOM object
// Param2: Node count
// Param3: Xml element
// Param4: Node type element
function readInnerChildNodes(objInnerChildNodes, nodesCount, nameUpper, objectNodeType)
{
    var innerChildCount = objInnerChildNodes.childNodes.length;
      
    for(var count=0; count< innerChildCount; count ++)
    {
        var objInnerChildNodeReader = objInnerChildNodes.childNodes[count];
        this.formatChildNode(objInnerChildNodeReader, nodesCount, nameUpper, objectNodeType);
        
        if(objInnerChildNodeReader.hasChildNodes)
        {
            this.readInnerChildNodes(objInnerChildNodeReader);
        }
    }
}

// Formats the child node with appropriate node elements. This function calls
// formatNodes where it enables the format element.
// Param1: Xml DOM object
// Param2: Node count
// Param3: Xml element
// Param4: Node type element
function formatChildNode(objFormatReader, nodesCount, nameUpper, objectNodeType)
{
    nameUpper = objFormatReader.nodeName.toUpperCase();
    objectNodeType = objFormatReader.nodeTypeString;
    this.formatNodes(objFormatReader, nodesCount, nameUpper, objectNodeType);
}

// Enable with appropriate format elements. This function also checks
// for text and calls formatTextWithRun function.
// Param1: Xml DOM object
// Param2: Node count
// Param3: Xml element
// Param4: Node type element
function formatNodes(objXmlReader, nodesCount, nameUpper, objectNodeType)
{
    switch(objectNodeType)
    {
        case "element":
        // Handle the begin element
        switch (nameUpper)
        {
            case ELEMENT_A:
                if(objXmlReader.attributes[0] !=null)
                {
                    link = objXmlReader.attributes[0].text;
                }
            case ELEMENT_B: 
                case ELEMENT_STRONG: bold = true;
                break;
            case ELEMENT_I: 
                case ELEMENT_EM: italic = true;
                break;
            case ELEMENT_U: underline = true;
                break;
            case ELEMENT_BR: 
                this.setLineBreak();
                break;
            case ELEMENT_P:
                if(lastElement == ELEMENT_P)
                {
                    if(nodesCount !=0)
                    {
                        this.setLineBreak();
                    }
                }
                break;
            case ELEMENT_UL:
                break;
            case ELEMENT_LI: bullet = true;
                this.setLineBreak();
                // Check for the empty bullets
                if(objXmlReader.nodeValue == null)
                {
                    this.formatTextWithRun(objXmlReader);
                }
                break;
            default: 
                break;
        }
        lastElement = nameUpper;
            break;
        case "text":
            this.checkForNestedTags(objXmlReader);
            this.formatTextWithRun(objXmlReader);
            break;
        default:
            break;
    }
}

// Sets the line break and added to the inlines of the
// given textblock.
function setLineBreak()
{
    var xamlFragment = "<LineBreak />"; 
    inlineTextBlock = plugin.content.createFromXaml(xamlFragment);
    _textBlock.Inlines.Add(inlineTextBlock);
}

// Checks for Nested Tags if detected within the input text.
// Param: Xml DOM object
function checkForNestedTags (objNestedXmlReader)
{
    if(objNestedXmlReader !=null)
    {
        if(objNestedXmlReader.parentNode !=null)
        {
            var objParentNode = objNestedXmlReader.parentNode;
	        
            var getNodeType = objParentNode.nodeTypeString;
            var getNameUpper = objParentNode.nodeName.toUpperCase();
	        
	        if(getNameUpper != "DIV" && getNameUpper != ELEMENT_P 
	           && getNameUpper != ELEMENT_UL && getNameUpper != ELEMENT_LI 
	           && getNameUpper != ELEMENT_A && getNameUpper != ELEMENT_BR
	           && getNameUpper != "text")
	        {
                switch(getNodeType)
                {
                    case "element":
                        switch(getNameUpper)
                        {
                            case ELEMENT_B: 
                                case ELEMENT_STRONG: bold = true;
                                break;
                            case ELEMENT_I: 
                                case ELEMENT_EM: italic = true;
                                break;
                            case ELEMENT_U: underline = true;
                                break;
                            default:
                                break;
                        }
                    default:
                        break;
                }
                this.checkForNestedTags(objParentNode);
            }
        }
    }
}

// Formats the text and assigned to the given textblock with
// inlines.
// Param: The Xml DOM object
function formatTextWithRun (objXmlReader)
{
    // Create a run text block
    var runTextBlock;
    
    // Create a Run for the visible text
    var xmlReplaced;
    xmlReplaced = objXmlReader.nodeValue;
    
    //Check for the empty bullet
    if(xmlReplaced == null)
    {
        xmlReplaced = "";
    }            

    // Get the node values
    var builderString = xmlReplaced;
    
    // Replace special characters with valid xml
    // replace & -> &amp;
    builderString = this.replaceAll(builderString, '&', '&amp;', false);
    
    // replace > -> &gt;
    builderString = this.replaceAll(builderString, '>', '&gt;', false);
    // replace < -> &lt;
    builderString = this.replaceAll(builderString, '<', '&lt;', false);
    
    // replace all inner double quotes with &quot;
    builderString = this.replaceAll(builderString, '"', '&quot;', false);
    
    // Create a Run to display it
    if(bullet)
    {
        // Add space before bullet (5) and after bullet (3) with bullet unicode character
        var run = '<Run Text ="' +  "     " + BULLET_UNICODE + "   " + '" ' + '></Run>'
                  
        // This call is to avoid formatting for the bullet unicode and its spaces
        runTextBlock = plugin.content.createFromXaml(run.toString(), true);
        _textBlock.Inlines.Add(runTextBlock);
        
        run = '<Run Text ="' + builderString.toString() + '" ';
    }
    else
    {
        var run = '<Run Text ="' + builderString.toString() + '" ';
    }
    // Style the Run appropriately
    if (bold) run += 'FontWeight = "Bold" ';
    if (italic) run += 'FontStyle = "Italic" ';
    if (underline) run += 'TextDecorations = "Underline" ';
    if (null != link)
    {
        // Links get styled and display their HREF since Run doesn't support MouseLeftButton* events
        run += 'TextDecorations = "Underline" ';
        run += 'Foreground = "Blue" ';
        run.Text += " <" + link + ">";
    }
    run += '></Run>';

    // Add the Run to the collection
    runTextBlock = plugin.content.createFromXaml(run.toString(), true);  

    _textBlock.Inlines.Add(runTextBlock);

    // Reset all state variables
    this.resetStateVariables();
}

// Replaces all the strings in the input text with 
// the given searchTerm string
// Param1: Input text
// Param2: String which needs to be replaced
// Param3: ReplaceWith string
// Param4: Ignore case
function replaceAll( str, searchTerm, replaceWith, ignoreCase )   
{
   var regex = "/"+searchTerm+"/g";
   if( ignoreCase ) regex += "i";
   return str.replace( eval(regex), replaceWith );
}

// Resets all the state variables
function resetStateVariables()
{
    bold = false;
    italic = false;
    underline = false;
    bullet = false;
    link = null;
    lastElement = null;
}

// Aligns the text to center inside the textblock.
// Param: TextBlock object
function centerAlignWithFormating(textBox)

{
    textBox.TextWrapping = "NoWrap";

    // Backing up the text
    var textBackup = textBox.Inlines.getItem(0).Text;
    var lenghtBeforeAddingSpace = textBox.ActualWidth;
    textBox.Inlines.getItem(0).Text = " " + textBox.Inlines.getItem(0).Text;
    var lenghtAfterAddingSpace = textBox.ActualWidth;
    var spaceLength = lenghtAfterAddingSpace - lenghtBeforeAddingSpace;

    // Putting back original
    textBox.Inlines.getItem(0).Text = textBackup;
    var difference = textBox.Width - textBox.ActualWidth;

    // Auto Size
    textBox.Height = textBox.ActualHeight;
    if(difference <= 0)
    {
        textBox.Width = textBox.ActualWidth;
    }
    
    // Center Alignment
    else if(difference > 0)
    {
        var paddingLength = difference/2;
        var no_Of_Spaces = Math.round(paddingLength/spaceLength);

        for(count=1; count <= no_Of_Spaces; count++)
        {
            textBox.Inlines.getItem(0).Text = " " + textBox.Inlines.getItem(0).Text;
        }
    }
}

// Aligns the text in as center alignment 
// and if the TextBox is smaller to accomodate the text, 
// auto sizes the TextBox to exactly accomodate the text
// Param1: Text to be displayed in TextBox
// Param2: TextBox object

function centerAlign(text, textBox)

{
    textBox.TextWrapping = "NoWrap";

    // Gets the Space length
    textBox.text = " ";

    var spaceLength = textBox.ActualWidth;

    // Actual length and textBox length
    textBox.text = text;

    var textBoxLength = textBox.Width;
    var textBoxActualTextLength = textBox.ActualWidth;
    var textBoxActualTextHeight = textBox.ActualHeight;

    // Auto Size
    textBox.Height = textBoxActualTextHeight;

    if(textBoxActualTextLength > textBoxLength)

    {
        textBox.Width = 0;
        textBox.text = text;
        textBoxActualTextLength = textBox.ActualWidth;
        textBox.Width = textBoxActualTextLength;
    }

    // Center Alignment
    else if(textBoxActualTextLength < textBoxLength)
    {
        var difference = textBoxLength - textBoxActualTextLength;
        var paddingLength = difference/2;
        var no_Of_Spaces = Math.round(paddingLength/spaceLength);

        for(var count=1; count <= no_Of_Spaces; count++)
        {
            text = " " + text + " ";
        }
        textBox.text = text;      
    }
}

// SIG // Begin signature block
// SIG // MIIbDwYJKoZIhvcNAQcCoIIbADCCGvwCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFNqgpcgZjO4c
// SIG // MeQ+2nJ4uE3aUpOOoIIV6jCCBIUwggNtoAMCAQICCmEF
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
// SIG // gjcCARUwIwYJKoZIhvcNAQkEMRYEFLR+RFXl5dztfDy6
// SIG // KJLCCApSfu88MF4GCisGAQQBgjcCAQwxUDBOoCaAJABN
// SIG // AGkAYwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4A
// SIG // Z6EkgCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVh
// SIG // cm5pbmcgMA0GCSqGSIb3DQEBAQUABIIBAAhvbVNmH4OU
// SIG // Lro13aJs1jDcFaCNGMwxtqoJRLAptJdLC8mn+yH0EJQI
// SIG // buTXFqCADCelD2XUbFBaE+TGcVKZ3waOSd29k8ApL1Ff
// SIG // njBLzF5VDmu3DqG5xiqB9q9TzCYGw6iJ35DYaiKnWnFR
// SIG // s3g7QS4YAZY915VZwvLL9ney5Y79wj0tFuST3nmlE6VU
// SIG // dVq17us3BNk82fT8Zvqt6xp4jLc406z5IqZcaes1fJDM
// SIG // Dc0imawEbqyc2aUD7DlUgtGs7FqrtNI++ou939U3q7KW
// SIG // ibXrpEztGcts1Tlfc4wSuAXA3aiK6DrCCe5tFo4KX0OR
// SIG // Ti1QGwbFnVSgBdliQwbVAjWhggIdMIICGQYJKoZIhvcN
// SIG // AQkGMYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBAgphFrUpAAAAAAAQMAcGBSsOAwIaoF0wGAYJ
// SIG // KoZIhvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0B
// SIG // CQUxDxcNMTAwMjE5MjIzNzIwWjAjBgkqhkiG9w0BCQQx
// SIG // FgQUMGzMNgUKEj3xwY/EBcnwqsyjMMcwDQYJKoZIhvcN
// SIG // AQEFBQAEggEA24uNEv2pjjj6xalZeuOZb7o+u9VQV+G3
// SIG // yLpp6Q83MnuN8eU02IUAdBlpoP+rll/2nWjjx6qGIsO+
// SIG // McZ4Uld8AeCP5H0Y/VoTEskuUUXNm2iNtBu4I3P/AbPd
// SIG // 8hzo/IpZMrABYWQxOV51DNylIlVz9q6PCExniXe61lte
// SIG // 4XxNcKGXPC3tidmrvePXx4Stg98sNIOIvuBm3H3kRAOx
// SIG // 0HSJAJoRgbwikUbgjodwuoKlc9jQuFCo4DO1HHr98agH
// SIG // 1oBNLdjOtBpjLbLGbGfEfeES65Eu45CKhnGDnN5QOLTf
// SIG // bTlwGNJTAuYyPqnO+WBQPPmT9EuOPP+JuRFdPihEcGcyhg==
// SIG // End signature block
