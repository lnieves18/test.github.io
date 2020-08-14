<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:param name="ActiveXObject"/>
<!-- <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/> -->
	<!-- Isolate the current content page's language. -->
	<xsl:variable name="pageLanguage" select="translate(/topic/@xml:lang,'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>
	<!-- Define the location of the globalization strings. -->
	<xsl:variable name="gStringsUri">platform/localization/<xsl:value-of select="translate($pageLanguage, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')"/>.xml</xsl:variable>
	<!-- Import the platform content from the localization xml file. -->
	<xsl:variable name="lowerCaseUnicodeCharacters" select="document($gStringsUri,/)//variable[@name = 'lowerCaseUnicodeCharacters']"/>
	<xsl:variable name="upperCaseUnicodeCharacters" select="document($gStringsUri,/)//variable[@name = 'upperCaseUnicodeCharacters']"/>

	<xsl:variable name="multipleChoice_title" select="document($gStringsUri,/)//variable[@name = 'multipleChoice_title']"/>
	<xsl:variable name="multipleChoice_feedbackButton" select="document($gStringsUri,/)//variable[@name = 'multipleChoice_feedbackButton']"/>
	<xsl:variable name="multipleChoice_questionSelect" select="document($gStringsUri,/)//variable[@name = 'multipleChoice_questionSelect']"/>
	<xsl:variable name="activity_summaryHeading" select="document($gStringsUri,/)//variable[@name = 'activity_summaryHeading']"/>
	<xsl:variable name="activity_summaryButton" select="document($gStringsUri,/)//variable[@name = 'activity_summaryButton']"/>
	<xsl:variable name="readerAid_tip" select="document($gStringsUri,/)//variable[@name = 'readerAid_tip']"/>
	<xsl:variable name="readerAid_caution" select="document($gStringsUri,/)//variable[@name = 'readerAid_caution']"/>
	<xsl:variable name="readerAid_warning" select="document($gStringsUri,/)//variable[@name = 'readerAid_warning']"/>
	<xsl:variable name="readerAid_important" select="document($gStringsUri,/)//variable[@name = 'readerAid_important']"/>
	<xsl:variable name="readerAid_note" select="document($gStringsUri,/)//variable[@name = 'readerAid_note']"/>
	<xsl:variable name="readerAid_studySheet" select="document($gStringsUri,/)//variable[@name = 'readerAid_studySheet']"/>
	<xsl:variable name="animation_transcriptHeader" select="document($gStringsUri,/)//variable[@name = 'animation_transcriptHeader']"/>
	<xsl:variable name="button_submit" select="document($gStringsUri,/)//variable[@name = 'button_submit']"/>
	<xsl:variable name="button_launch" select="document($gStringsUri,/)//variable[@name = 'button_launch']"/>
	<xsl:variable name="demonstration_windowTitle" select="document($gStringsUri,/)//variable[@name = 'demonstration_windowTitle']"/>
	<xsl:variable name="demonstration_transcriptPrint" select="document($gStringsUri,/)//variable[@name = 'demonstration_transcriptPrint']"/>
	<xsl:variable name="demonstration_transcriptPrintWindowTitle" select="document($gStringsUri,/)//variable[@name = 'demonstration_transcriptPrintWindowTitle']"/>
	<xsl:variable name="simulation_windowTitle" select="document($gStringsUri,/)//variable[@name = 'simulation_windowTitle']"/>
	<xsl:variable name="simulation_transcriptPrint" select="document($gStringsUri,/)//variable[@name = 'simulation_transcriptPrint']"/>
	<xsl:variable name="simulation_transcriptPrintWindowTitle" select="document($gStringsUri,/)//variable[@name = 'simulation_transcriptPrintWindowTitle']"/>
	<xsl:variable name="introduction_moduleTitle" select="document($gStringsUri,/)//variable[@name = 'introduction_moduleTitle']"/>
	<xsl:variable name="sortGame_instructions" select="document($gStringsUri,/)//variable[@name = 'sortGame_instructions']"/>
	<xsl:variable name="clickTable_instructions" select="document($gStringsUri,/)//variable[@name = 'clickTable_instructions']"/>
  <xsl:variable name="media_transcriptPrint" select="document($gStringsUri,/)//variable[@name = 'media_transcriptPrint']"/>
  <xsl:variable name="media_transcriptPrintWindowTitle" select="document($gStringsUri,/)//variable[@name = 'media_transcriptPrintWindowTitle']"/>
  <xsl:variable name="media_KeyPointsHeader" select="document($gStringsUri,/)//variable[@name = 'media_KeyPointsHeader']"/>
  <xsl:variable name="media_KeyPointsText" select="document($gStringsUri,/)//variable[@name = 'media_KeyPointsText']"/>
  <xsl:variable name="interactive_yes" select="document($gStringsUri,/)//variable[@name = 'interactive_yes']"/>
  <xsl:variable name="interactive_no" select="document($gStringsUri,/)//variable[@name = 'interactive_no']"/>
  <xsl:variable name="interactive_reset" select="document($gStringsUri,/)//variable[@name = 'interactive_reset']"/>
  <xsl:variable name="interactive_decision" select="document($gStringsUri,/)//variable[@name = 'interactive_decision']"/>
  <xsl:variable name="interactive_undefined" select="document($gStringsUri,/)//variable[@name = 'interactive_undefined']"/>
  <xsl:variable name="showHide_ShowAll" select="document($gStringsUri,/)//variable[@name = 'showHide_ShowAll']"/>
  <xsl:variable name="showHide_Show" select="document($gStringsUri,/)//variable[@name = 'showHide_Show']"/>

	<!-- Define the location of the settings strings. -->
	<xsl:variable name="gSettingsUri">platform/settings/settings.xml</xsl:variable>
	<!-- Settings -->
	<xsl:variable name="silverlight_required" select="document($gSettingsUri,/)//variable[@name = 'silverlight_required']"/>
	<xsl:variable name="vmLab_support" select="document($gSettingsUri,/)//variable[@name = 'vmLab_support']"/>

	<!-- Script modified variables -->
	<xsl:variable name="silverLightInstalled">false</xsl:variable>

	<xsl:variable name="mediaPlayerSilverLightNodeTree"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_2"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_3"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_4"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_5"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_6"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_7"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_8"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_9"></xsl:variable>
  <xsl:variable name="mediaPlayerSilverLightNodeTree_10"></xsl:variable>

	<xsl:variable name="captionMediaSilverLightExists">false</xsl:variable>
	<xsl:variable name="adventureSilverLightExists">false</xsl:variable>
	<xsl:variable name="sortGameSilverLightExists">false</xsl:variable>
	<xsl:variable name="tileFlipSilverLightExists">false</xsl:variable>
	<xsl:variable name="dragAndDropSilverLightExists">false</xsl:variable>

	<xsl:variable name="captionMediaSilverLightNodeTree"></xsl:variable>
	<xsl:variable name="adventureSilverLightNodeTree"></xsl:variable>
	<xsl:variable name="sortGameSilverLightNodeTree"></xsl:variable>
	<xsl:variable name="tileFlipSilverLightNodeTree"></xsl:variable>
	<xsl:variable name="dragAndDropSilverLightNodeTree"></xsl:variable>
  <xsl:variable name="mediaSilverLightNodeTree"></xsl:variable>
  <xsl:variable name="interactiveJobAidSilverLightNodeTree"></xsl:variable>
  <xsl:variable name="sliderSilverLightNodeTree"></xsl:variable>
  <xsl:variable name="sequenceSilverLightNodeTree"></xsl:variable>
  <xsl:variable name="flashCardSilverLightNodeTree"></xsl:variable>

	<!--True False template variables-->
	<xsl:variable name="trueFalse_title" select="document($gStringsUri,/)//variable[@name = 'trueFalse_title']"/>
	<xsl:variable name="trueFalse_trueAnswer" select="document($gStringsUri,/)//variable[@name = 'trueFalse_trueAnswer']"/>
	<xsl:variable name="trueFalse_falseAnswer" select="document($gStringsUri,/)//variable[@name = 'trueFalse_falseAnswer']"/>
  <xsl:variable name="trueFalse_selectAnswer" select="document($gStringsUri,/)//variable[@name = 'trueFalse_selectAnswer']"/>

  <!--Essay question template variables-->
  <xsl:variable name="essayQuestion_question" select="document($gStringsUri,/)//variable[@name = 'essayQuestion_question']"/>
  <xsl:variable name="essayQuestion_answer" select="document($gStringsUri,/)//variable[@name = 'essayQuestion_answer']"/>
  <xsl:variable name="essayQuestion_instruction" select="document($gStringsUri,/)//variable[@name = 'essayQuestion_instruction']"/>
  <xsl:variable name="essayQuestion_answerInstruction" select="document($gStringsUri,/)//variable[@name = 'essayQuestion_answerInstruction']"/>
  <xsl:variable name="essayQuestion_submitInstruction" select="document($gStringsUri,/)//variable[@name = 'essayQuestion_submitInstruction']"/>

	<!-- constants -->
	<xsl:variable name="APOS">&apos;</xsl:variable>
	<xsl:variable name="FAKE_APOS">&#8242;</xsl:variable>

	<xsl:variable name="lessonTitle">
    
    <xsl:value-of select="topic/@title"/>
	</xsl:variable>
	<xsl:variable name="escapedLessonTitle">
		<xsl:value-of select="translate($lessonTitle, $APOS, $FAKE_APOS)"/>
	</xsl:variable>
	<xsl:variable name="topicTitle">
    <xsl:value-of select="topic/@title"/>
	</xsl:variable>
	<xsl:variable name="escapedTopicTitle">
		<xsl:value-of select="translate($topicTitle, $APOS, $FAKE_APOS)"/>
	</xsl:variable>

	<xsl:template match="/">
		<html xml:lang="{$pageLanguage}" lang="{$pageLanguage}">
			<head>
				<meta http-equiv="content-type" content="application/xhtml+xml;charset=UTF-8"/>
				<title><xsl:value-of select="$lessonTitle"/></title>
			</head>
			<body>
				<!-- CONTENT -->
				<div id="contentBlock">
					<xsl:attribute name="class">big</xsl:attribute>
					<div id="topBlock">
						<!-- Template name - only for "glossary000". -->
						<xsl:attribute name="class"><xsl:value-of select="//topic/@type"/></xsl:attribute>

						<h1><xsl:value-of select="$lessonTitle"/></h1>
						<div id="pageHeading">
							<div id="pageContent">
								<xsl:apply-templates/>
							</div>
						</div>
					</div>
				</div>
			</body>
		</html>
	</xsl:template>


	<xsl:template match="/topic[@type='conceptFact000']">
		<xsl:apply-templates select="./media"/>
		<xsl:apply-templates select="./text"/>
	</xsl:template>

	<xsl:template match="/topic[@type='labScenario000']">
		<xsl:apply-templates select="./media"/>
		<xsl:apply-templates select="./text"/>
	</xsl:template>

	<xsl:template match="/topic[@type='animation000']">
		<div class="animation">
			<xsl:apply-templates select="./media"/>
      <xsl:if test="substring(./media/@uri, (string-length(./media/@uri)-2)) != 'wmv'">
			  <h3><xsl:value-of select="$animation_transcriptHeader"/></h3>
			  <xsl:apply-templates select="./text"/>
      </xsl:if>
		</div>
	</xsl:template>
  <xsl:template match="/topic[@type='clickTableAnimation000']">
    <div class="clickTableAnimation">
      <xsl:apply-templates select="./text"/>
      <xsl:apply-templates select="./table"/>
    </div>
  </xsl:template>
  <xsl:template match="/topic[@type='media000']">
    <table class="mediaTable">
      <tr>
        <td class="mediaTableData">
          <div>
            <xsl:copy-of select="$mediaSilverLightNodeTree" />
          </div>
        </td>
      </tr>
    </table>
    <xsl:choose>
      <xsl:when test="string-length(//topic/activity/text[1]) &gt; '0'">
        <div class="printLaunch">
          <p>
            <u onclick="transcriptDynamicPrint(700, 600, '{$pageLanguage}', contentPageUri(), '//topic/activity/text[1]', '{$media_transcriptPrintWindowTitle}', '{$escapedLessonTitle}', '{$escapedTopicTitle}');">
              <xsl:value-of select="$media_transcriptPrint"/>
            </u>
          </p>
        </div>
      </xsl:when>
    </xsl:choose>
  </xsl:template>
	<xsl:template match="/topic[@type='introduction000']">

		<xsl:choose>
			<!-- When there is any content for the double left div. -->
			<xsl:when test="string-length(//media/@uri) &gt; '0' and string-length(//audio/@uri) &gt; '0' and string-length(//audio/transcript) &gt; '0' or string-length(./activity/media[1]/@uri) &gt; '0'">
				<div class="doubleLeft">
					<xsl:choose>
						<xsl:when test="string-length(//media/@uri) &gt; '0' and string-length(//audio/@uri) &gt; '0' and string-length(//audio/transcript) &gt; '0'">
							<xsl:variable name="activityType" select="//activity/@type"/>
							<xsl:variable name="activitySilverlightSupportSettingName">silverlight_<xsl:value-of select="$activityType"/>Supported</xsl:variable>
							<xsl:variable name="activitySilverlightSupported" select="document($gSettingsUri,/)//variable[@name = $activitySilverlightSupportSettingName]"/>
							<!-- Voice of the Expert -->
							<xsl:choose>
								<xsl:when test="($silverLightInstalled='true' and $activitySilverlightSupported='true') or ($silverlight_required='true' and $activitySilverlightSupported='true')">
									<xsl:choose>
										<xsl:when test="$activityType = 'captionMedia'">
											<xsl:copy-of select="$captionMediaSilverLightNodeTree" />
										</xsl:when>
									</xsl:choose>
								</xsl:when>
								<xsl:otherwise>
                  <xsl:choose>
                    <xsl:when test="$ActiveXObject!='' and $ActiveXObject!='true'">
                      <object class="{$activityType}" type="application/x-shockwave-flash" data="platform/flash/voiceofexpert.swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">
                        <param name="movie" value="platform/flash/voiceofexpert.swf"/>
                        <param name="swliveconnect" value="true"/>
                      </object>
                    </xsl:when>
                    <xsl:otherwise>
                      <object class="{$activityType}" type="application/x-shockwave-flash" data="platform/flash/voiceofexpert.swf">
                        <param name="movie" value="platform/flash/voiceofexpert.swf"/>
                        <param name="swliveconnect" value="true"/>
                      </object>
                    </xsl:otherwise>
                  </xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:when>
						<xsl:otherwise>
							<xsl:variable name="mediaUri" select="./activity/media[1]/@uri"/>
							<xsl:variable name="imageAlt" select="./activity/media[1]/alt"/>
							<xsl:variable name="mediaUriLowerCase" select="translate($mediaUri, $upperCaseUnicodeCharacters, $lowerCaseUnicodeCharacters)"/>
							<xsl:choose>
								<xsl:when test="substring($mediaUriLowerCase, (string-length($mediaUriLowerCase) - string-length('.swf')) + 1) = '.swf'">
                  <xsl:choose>
                    <xsl:when test="$ActiveXObject!='' and $ActiveXObject!='true'">
                      <object type="application/x-shockwave-flash" data="{$mediaUri}" >
                        <param name="movie" value="{$mediaUri}" />
                      </object>
                    </xsl:when>
                    <xsl:otherwise>
                      <object type="application/x-shockwave-flash" data="{$mediaUri}" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">
                        <param name="movie" value="{$mediaUri}" />
                      </object>
                    </xsl:otherwise>
                  </xsl:choose>
								</xsl:when>
								<xsl:otherwise>
									<xsl:choose>
										<xsl:when test="string-length($mediaUri) &gt; '0' or string-length($imageAlt) &gt; '0'">
											<img class="imageMedia" src="{$mediaUri}" alt="{$imageAlt}"/>
										</xsl:when>
									</xsl:choose>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:otherwise>
					</xsl:choose>
				</div>
			</xsl:when>
		</xsl:choose>


		<div class="doubleRight">
			<!-- overview H3 -->
			<xsl:apply-templates select="./heading[1]"/>
			<xsl:apply-templates select="./text[1]"/>

			<!-- objectives H3 -->
			<xsl:apply-templates select="./heading[2]"/>
			<xsl:apply-templates select="./text[2]"/>
		</div>
	</xsl:template>


	<xsl:template match="/topic[@type='demo000']">

		<div class="doubleLeft">
			<!-- demo image -->
			<xsl:apply-templates select="./media[1]"/>
		</div>

		<div class="doubleRight">
			<!-- informative text -->
			<p><xsl:apply-templates select="./text[1]"/></p>

			<!-- the demo launch button -->
			<xsl:choose>
				<xsl:when test="string-length(./media[2]/@uri) &gt; '0'">
          <div width="100%" height="100%"> <!--Fix for IE8, Demo-->
					<xsl:variable name="mediaUriB" select="./media[2]/@uri"/>
					<button class="mediaLaunch" onclick="javascript: dynamicMediaWindow(800, 600, '{$pageLanguage}', '{$demonstration_windowTitle}', '{$mediaUriB}', 'demo', contentPageUri(), '/topic/text[2]'); return false;"><xsl:value-of select="$button_launch"/></button>
          </div>
				</xsl:when>
			</xsl:choose>
			<!-- The demo transcript print message / button. -->
			<xsl:choose>
				<xsl:when test="string-length(./text[2]) &gt; '0'">
					<div class="printLaunch"><p><u onclick="transcriptDynamicPrint(700, 600, '{$pageLanguage}', contentPageUri(), '//topic/text[2]', '{$demonstration_transcriptPrintWindowTitle}', '{$escapedLessonTitle}', '{$escapedTopicTitle}');"><xsl:value-of select="$demonstration_transcriptPrint"/></u></p></div>
				</xsl:when>
			</xsl:choose>
		</div>
	</xsl:template>


	<xsl:template match="/topic[@type='simulation000']">
		<div class="doubleLeft">
			<!-- simulation image -->
			<xsl:apply-templates select="./media[1]"/>
		</div>

		<div class="doubleRight">
			<!-- informative text -->
			<p><xsl:apply-templates select="./text[1]"/></p>

			<!-- the simulation launch button -->
			<xsl:choose>
				<xsl:when test="string-length(./media[2]/@uri) &gt; '0'">
					<xsl:variable name="mediaUriB" select="./media[2]/@uri"/>
					<button onclick="javascript: dynamicMediaWindow(787, 483, '{$pageLanguage}', '{$simulation_windowTitle}', '{$mediaUriB}', 'sim', contentPageUri(), '/topic/text[2]'); return false;"><xsl:value-of select="$button_launch"/></button>
				</xsl:when>
			</xsl:choose>
			<!-- The simulation transcript print message / button. -->
			<xsl:choose>
				<xsl:when test="string-length(./text[2]) &gt; '0'">
					<div class="printLaunch"><p><u onclick="transcriptDynamicPrint(700, 600, '{$pageLanguage}', contentPageUri(), '//topic/text[2]', '{$simulation_transcriptPrintWindowTitle}', '{$escapedLessonTitle}', '{$escapedTopicTitle}');"><xsl:value-of select="$simulation_transcriptPrint"/></u></p></div>
				</xsl:when>
			</xsl:choose>
		</div>
	</xsl:template>

	<xsl:template match="/topic[@type='table000']">
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="/topic[@type='clickTable000']">
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="/topic[@type='multipleChoice000']">
		<div class="questionHeader">
			<h3><xsl:value-of select="$multipleChoice_title"/></h3>
			<ol>
				<!-- create the item navigation bar at the top of the page -->
				<xsl:for-each select="//item">
					<xsl:variable name="questionNumber" select="position()"/>
					<xsl:choose>
						<xsl:when test="string-length(.) &gt; '0'">
							<li>
								<a onclick="activateQuestion(this, {$questionNumber}); return false;" href="">
									<xsl:choose>
										<xsl:when test="$questionNumber = 1">
											<xsl:attribute name="class">toggleQuestion active</xsl:attribute>
										</xsl:when>
										<xsl:otherwise>
											<xsl:attribute name="class">toggleQuestion</xsl:attribute>
										</xsl:otherwise>
									</xsl:choose>
									<xsl:value-of select="position()"/>
								</a>
							</li>
						</xsl:when>
					</xsl:choose>
				</xsl:for-each>
			</ol>
		</div>
    <xsl:call-template name="arrowIndication"/>
		<xsl:apply-templates/>
	</xsl:template>

	<!--Start: True False template-->
	<xsl:template match="/topic[@type='trueFalse000']">
		<div class="questionHeader">
			<h3>
				<xsl:value-of select="$trueFalse_title"/>
			</h3>
			<ol>
				<!-- create the item navigation bar at the top of the page -->
				<xsl:for-each select="//item">
					<xsl:variable name="questionNumber" select="position()"/>
					<xsl:choose>
						<xsl:when test="string-length(.) &gt; '0'">
							<li>
								<a onclick="activateQuestion(this, {$questionNumber}); return false;" href="">
									<xsl:choose>
										<xsl:when test="$questionNumber = 1">
											<xsl:attribute name="class">toggleQuestion active</xsl:attribute>
										</xsl:when>
										<xsl:otherwise>
											<xsl:attribute name="class">toggleQuestion</xsl:attribute>
										</xsl:otherwise>
									</xsl:choose>
									<xsl:value-of select="position()"/>
								</a>
							</li>
						</xsl:when>
					</xsl:choose>
				</xsl:for-each>
			</ol>
		</div>
    <xsl:call-template name="arrowIndication"/>
		<xsl:apply-templates/>
	</xsl:template>
	<!--END: True False template-->

  <xsl:template name="arrowIndication">
    <div class="questionActive">
      <img id="questionNumberArrow" src="platform/images/green_arrow.gif"/>
    </div>
  </xsl:template>

  <!--Text, Picture and Table-->
  <xsl:template match="/topic[@type='textPictureTable000']">
    <xsl:for-each select="//item">
      <div class="textPictureTable">
        <xsl:apply-templates select="./heading"></xsl:apply-templates>
        <div style="width:100%">
          <xsl:apply-templates select="./media"></xsl:apply-templates>
        </div>
        <xsl:apply-templates select="./text"></xsl:apply-templates>
        <xsl:apply-templates select="./table"></xsl:apply-templates>
      </div>
    </xsl:for-each>
  </xsl:template>

  <!--Essay question assessment-->
  <xsl:template match="/topic[@type='essayQuestion000']">
    <div class="questionHeader">
      <h3>
        <xsl:value-of select="$essayQuestion_question"/>
      </h3>
    </div>
    <xsl:apply-templates/>
  </xsl:template>
  <!--End: Essay question template-->
	<xsl:template match="/topic[@type='glossary000']">
		<xsl:choose>
			<xsl:when test="count(//definition) &gt; '0'">
        <div id="glossaryNavDiv">
				<ul id="glossaryNav">
					<xsl:for-each select="//definition[not(translate(substring(@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)=translate(substring(preceding-sibling::definition[1]/@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters))]">
						<xsl:sort select="@term"/>

						<xsl:variable name="indexTermLetter"><xsl:value-of select="translate(substring(./@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>
						<xsl:variable name="indexPrecedingTermLetter"><xsl:value-of select="translate(substring(preceding::definition/@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>

						<xsl:choose>
							<xsl:when test="$indexTermLetter != $indexPrecedingTermLetter">
								<li><a href="#{$indexTermLetter}"><xsl:value-of select="$indexTermLetter"/></a></li>
							</xsl:when>
						</xsl:choose>
					</xsl:for-each>
				</ul>
        </div>
        <div id="GlossaryContent" >
				<xsl:for-each select="//definition">
					<xsl:sort select="substring(@term, 1, 1)"/>
					<xsl:sort select="@term"/>

					<xsl:variable name="bodyTermLetter"><xsl:value-of select="translate(substring(./@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>
					<xsl:variable name="bodyPrecedingTermLetter"><xsl:value-of select="translate(substring(preceding::definition[1]/@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>

					<xsl:choose>
						<xsl:when test="$bodyTermLetter != $bodyPrecedingTermLetter">
							<a class="termLetter" id="{$bodyTermLetter}">.</a>
							<h3 class="termLetter"><xsl:value-of select="$bodyTermLetter"/></h3>
						</xsl:when>
					</xsl:choose>
					<h4 class="glossaryTerm">
						<xsl:choose>
							<xsl:when test="substring(@term,2,3) = ' - '">
								<xsl:value-of select="substring(@term,5)"/>
							</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="@term"/>
							</xsl:otherwise>
						</xsl:choose>
					</h4>
					<xsl:apply-templates/>
				</xsl:for-each>
        </div>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

  <!--Show/Hide-->
  <xsl:template match="/topic[@type = 'showHide000']">
    <table id="showHidePreview" style="background-color:White; border-color: White; width:100%">
      <tr>
        <td id="mediaColumn" style="width:'auto'; background-color:White; border:none;">
          <xsl:apply-templates select="./media"/>
        </td>
        <!--the divider on the left is visible only if an image is uploaded-->
        <xsl:if test="//topic/media/@uri != ''">
          <td id="textColumn" style="width:'100%'; background-color:White; border-top-color:White; border-left-color:RGB(0,50,155);">
            <div class="showHideFirstParagraph" unselectable="on">
              <xsl:apply-templates select="./text[1]"/>
            </div>
            <xsl:apply-templates select="./list"/>
            <div class="showHideLastParagraph" unselectable="on">
              <xsl:apply-templates select="./text[2]"/>
            </div>
          </td>
        </xsl:if>
        <xsl:if test="//topic/media/@uri = ''">
          <td id="textColumn" style="width:'auto'; background-color:White; border-top-color:White; border-left-color:White;">
            <div class="showHideFirstParagraph" unselectable="on">
              <xsl:apply-templates select="./text[1]"/>
            </div>
            <xsl:apply-templates select="./list"/>
            <div class="showHideLastParagraph" unselectable="on">
              <xsl:apply-templates select="./text[2]"/>
            </div>
          </td>
        </xsl:if>
      </tr>
    </table>
  </xsl:template>
	<xsl:template match="//text">
    <xsl:choose>
      <xsl:when test="/topic[@type = 'showHide000']">
        <xsl:choose>
          <xsl:when test="./parent::*[name() = 'list']">
            <div id="listItems" class="textHide" unselectable="on">
              <xsl:apply-templates/>
            </div>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates></xsl:apply-templates>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<div class="textParent"><xsl:apply-templates/></div>
			</xsl:when>
		</xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
	</xsl:template>
	<xsl:template match="//heading">
    <xsl:choose>
      <xsl:when test="/topic[@type = 'showHide000'] and string-length(.) &gt; '0'">
        <img class="showHideHeadingArrow" id="pointerArrow" src="platform/images/arrow_right.png" onclick="javascript:showHide(this);" style="cursor:hand" title="{$showHide_Show}"/>
        <h4 class="showHideHeadingText" unselectable="on" style="cursor:hand;" onclick="javascript:showHide(this);" title="{$showHide_Show}">
          <xsl:apply-templates/>
        </h4>
      </xsl:when>
      <xsl:when test="/topic[@type = 'textPictureTable000'] and string-length(.) &gt; '0'">
        <h4 class="textPictureTableHeading">
          <xsl:apply-templates/>
        </h4>
      </xsl:when>
      <xsl:otherwise>
        <xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<h3><xsl:apply-templates/></h3>
			</xsl:when>
		</xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
	</xsl:template>
	<xsl:template match="//text/heading">
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<h4><xsl:value-of select="."/></h4>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

	<!-- Multiple choice templates -->
	<xsl:template match="//assessment">
		<div class="assessment">
			<xsl:apply-templates/>
      <xsl:if test="@type!='essayQuestion'">
        <div class="assessmentFeedback">
          <div class="header">
            <span></span>
          </div>
          <div class="body">
            <span></span>
          </div>
          <div class="footer">
            <button title="{$multipleChoice_feedbackButton}" onclick="this.parentNode.parentNode.className = 'assessmentFeedback hidden';">             
              <xsl:value-of select="$multipleChoice_feedbackButton"/>
            </button>
          </div>
        </div>
      </xsl:if>
		</div>
	</xsl:template>
	<xsl:template match="//item">
		<xsl:param name="itemPosition" select="position()"/>
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
        <xsl:choose>
          <xsl:when test="./parent::*[@type='essayQuestion']">
            <div style="margin-bottom:8px;">
            <xsl:apply-templates/>
            <button class="submitButtonInstruction" disabled="true" onclick="configureCompletedEssayItem(this.parentNode);">
              <xsl:value-of select="$button_submit"/>
            </button>
              <span class="answerInstructions">
                <xsl:value-of select="$essayQuestion_submitInstruction"/>
              </span>
            </div>
          </xsl:when>

          <xsl:otherwise>
            <div class="itemParent itemParent{$itemPosition}">
              <xsl:apply-templates>
                <xsl:with-param name="itemPos" select="position()"/>
              </xsl:apply-templates>
              <button disabled="true" class="submitButton">
                <xsl:value-of select="$button_submit"/>
              </button>
            </div>
          </xsl:otherwise>
        </xsl:choose>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//question">
		<xsl:param name="itemPos">default</xsl:param>
		<xsl:variable name="answerCorrect" select="./@correct"/>
		<div class="questionParent">
      <xsl:choose>
        <xsl:when test="./parent::*/parent::*[@type='essayQuestion']">
          <div class="essayQuestionContent"><xsl:apply-templates/></div>
        </xsl:when>
        <xsl:otherwise>
          <div class="questionContent"><xsl:apply-templates/></div>
        </xsl:otherwise>
      </xsl:choose>
			<!-- If this is a multiple choice question. -->
			<xsl:choose>
				<xsl:when test="name(./parent::*/parent::*) = 'assessment' and ./parent::*/parent::*[@type='multipleChoice']">
					<div class="questionDescription"><p><xsl:value-of select="$multipleChoice_questionSelect"/></p></div>
				</xsl:when>
			</xsl:choose>
			<!--If this is a True False question-->
			<xsl:choose>
				<xsl:when test="./parent::*/parent::*/parent::*[@type='trueFalse000']">
          <div class="questionDescription"><p><xsl:value-of select="$trueFalse_selectAnswer"/></p></div>
					<div class="answerParent">
						<div class="answerParent">
              <input class="{$answerCorrect}" type="radio" name="group{$itemPos}" value="1" onclick="activateTrueFalseSubmit(this.parentNode.parentNode.parentNode.parentNode.lastChild);"></input>
							<div class="answerContent">
								<p>
									<xsl:value-of select="$trueFalse_trueAnswer"></xsl:value-of>
								</p>
							</div>
						</div>
						<div class="answerParent">
              <input class="{$answerCorrect}" type="radio" name="group{$itemPos}" value="2" onclick="activateTrueFalseSubmit(this.parentNode.parentNode.parentNode.parentNode.lastChild);"></input>
							<div class="answerContent">
								<p>
									<xsl:value-of select="$trueFalse_falseAnswer"></xsl:value-of>
								</p>
							</div>
						</div>
					</div>
				</xsl:when>
			</xsl:choose>
			<!-- If this is an essay question. -->
			<xsl:choose>
				<xsl:when test="./parent::*/parent::*/parent::*[@type='essayQuestion000']">
          <div class="answerHeader">
            <h3>
              <xsl:value-of select="$essayQuestion_answer"/>
            </h3>
          </div>
          <div class="answerInstructions"><xsl:value-of select="$essayQuestion_instruction"/></div>
					<div class="answerParent">
						<textarea class="answerInput" rows="15" cols="108" name="answer" onfocus="activateText(this, true);" onblur="activateText(this, false);" onkeydown="validateAnswerText(this, 250);" onkeyup="validateAnswerText(this, 250);">
              <xsl:value-of select="$essayQuestion_answerInstruction"/>
            </textarea>
					</div>
				</xsl:when>
			</xsl:choose>
			<!--End-->
		</div>
	</xsl:template>
	<xsl:template match="//answer">
		<xsl:param name="itemPos">default</xsl:param>
		<xsl:variable name="answerPosition" select="position() - 1"/>
		<xsl:variable name="answerCorrect" select="./@correct"/>
		<xsl:variable name="answerContent" select="."/>
		<xsl:choose>
			<xsl:when test="string-length(.) != '0' and $answerContent != '&lt;p&gt;&lt;/p&gt;'">
				<div class="answerParent">
					<input class="{$answerCorrect}" type="radio" name="group{$itemPos}" value="{$answerPosition}" onclick="activateSubmit(this.parentNode.parentNode.parentNode.lastChild);"/>
					<div class="answerContent">
						<p><xsl:apply-templates/></p>
					</div>
				</div>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//feedback">
		<div class="feedbackParent">
      <span></span>
			<xsl:apply-templates/>
		</div>
	</xsl:template>


	<!-- pass throughs -->
	<xsl:template match="//table">
		<xsl:variable name="tableType" select="./@type"/>
		<xsl:variable name="farthestColumn">
			<xsl:choose>
				<xsl:when test="string-length(./tr/th[3]) &gt; '0' or string-length(./tr/th[3]/@uri) &gt; '0'">3</xsl:when>
				<xsl:otherwise>
					<xsl:choose>
						<xsl:when test="string-length(./tr/th[2]) &gt; '0' or string-length(./tr/th[2]/@uri) &gt; '0'">2</xsl:when>
						<xsl:otherwise>
							<xsl:choose>
								<xsl:when test="string-length(./tr/th[1]) &gt; '0' or string-length(./tr/th[1]/@uri) &gt; '0'">1</xsl:when>
							</xsl:choose>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<div class="tableContainer">
			<!-- If this is a click table, then throw in click table instructions. -->
			<xsl:choose>
		        <xsl:when test="$tableType = 'click' or $tableType = 'ClickTableAnimation' ">
					<div class="instructionsBar"><p><xsl:value-of select="$clickTable_instructions"/></p></div>
				</xsl:when>
			</xsl:choose>
			<table class="{$tableType}">
				<!-- If this table has a display type, set the type.  Example: table type="click" -becomes- table class="click" -->
				<xsl:choose>
					<xsl:when test="string-length($tableType) &gt; 0">
						<xsl:attribute name="class"><xsl:value-of select="./@type"/></xsl:attribute>
					</xsl:when>
				</xsl:choose>
				<tbody>
					<xsl:apply-templates>
						<xsl:with-param name="farthestColumn"><xsl:value-of select="$farthestColumn"/></xsl:with-param>
					</xsl:apply-templates>
				</tbody>
			</table>
		</div>
	</xsl:template>
<!--	<xsl:template match="tr"><tr><xsl:apply-templates/></tr></xsl:template> -->
<!--	<xsl:template match="th"><th><xsl:apply-templates/></th></xsl:template> -->

	<!-- html pass throughs -->
  <xsl:template match="//list">
    <xsl:variable name="headingText">
      <xsl:for-each select=".//heading">
        <xsl:value-of select="."/>
      </xsl:for-each>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="/topic[@type = 'showHide000']">
        <xsl:if test="./parent::*[name() = 'topic'] and string-length($headingText) &gt; '0'">
            <div id="ShowHideAll" class="showAllContainer">
				<img class="showAllArrow"  src="platform/images/arrow_right.png" title="{$showHide_ShowAll}" onclick="javascript:showHide(this);" style="cursor:hand"/>
				<h4 class="showAllText" style="cursor:hand;" onclick="javascript:showHide(this);" title="{$showHide_ShowAll}" unselectable="on">
              <xsl:value-of select="$showHide_ShowAll"/>
            </h4>
            </div>
          </xsl:if>
      </xsl:when>
    </xsl:choose>
    <div class="list">
      <xsl:apply-templates/>
    </div>
  </xsl:template>
	<xsl:template match="//group">
		<xsl:param name="itemPos">1</xsl:param>
		<div class="group">
			<xsl:apply-templates>
				<xsl:with-param name="itemPos" select="$itemPos"/>
			</xsl:apply-templates>
		</div>
	</xsl:template>


<!-- highest th position -->
<!-- each tr determines if it has any content (text and uri content) and then it instantiates itself -->
	<xsl:template match="//tr">
		<xsl:param name="farthestColumn">10</xsl:param>
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0' or string-length(.//@uri) &gt; '0'">
				<tr class="totalColumns{$farthestColumn}">
					<xsl:apply-templates>
						<xsl:with-param name="farthestColumn"><xsl:value-of select="$farthestColumn"/></xsl:with-param>
					</xsl:apply-templates>
				</tr>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//th">
		<xsl:param name="farthestColumn">10</xsl:param>
		<xsl:variable name="thPosition"><xsl:value-of select="position()"/></xsl:variable>
		<xsl:choose>
			<xsl:when test="$thPosition &lt;= $farthestColumn">
				<th class="pos{$thPosition}"><div class="cellInner"><xsl:apply-templates/></div></th>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//td">
		<xsl:param name="farthestColumn">10</xsl:param>
		<xsl:variable name="tdPosition"><xsl:value-of select="position()"/></xsl:variable>
		<xsl:choose>
			<xsl:when test="$tdPosition &lt;= $farthestColumn">
				<td class="pos{$tdPosition}">
          <xsl:choose>
            <xsl:when test="topic[@type='clickTableAnimation000']">
              <div class ="cellInner">
                <xsl:apply-templates select ="//media"></xsl:apply-templates>
              </div>
              <div class="transcriptText">
                <xsl:apply-templates select ="//transcript"></xsl:apply-templates>
              </div>
            </xsl:when>
            <xsl:otherwise>
              <div class="cellInner"><xsl:apply-templates/></div>
            </xsl:otherwise>
          </xsl:choose>
        </td>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

  <xsl:template match="//transcript">
    <xsl:choose>
      <xsl:when test="/topic[@type='clickTableAnimation000']">
        <xsl:variable name="media" select="parent::node()//media/@uri"></xsl:variable>
        <xsl:if test="substring($media, (string-length($media)-2)) != 'wmv'">
          <div class="transcriptContent">
            <div class="transcriptHeader">
              <xsl:value-of select="$animation_transcriptHeader"/>
              <img class="showTranscript"  src="platform/images/arrow_right.png" onclick="javascript:hideTranscript(this);"></img>
            </div>
            <div class="transcriptText">
              <xsl:apply-templates></xsl:apply-templates>
            </div>
          </div>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise>
          <xsl:apply-templates/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

	<xsl:template match="//media">
		<xsl:variable name="mediaUri"><xsl:value-of select="@uri"/></xsl:variable>
		<xsl:variable name="mediaAltText"><xsl:value-of select="./alt"/></xsl:variable>

		<xsl:choose>
			<xsl:when test="substring($mediaUri,string-length($mediaUri) - 2) = 'jpg' or substring($mediaUri,string-length($mediaUri) - 3) = 'jpeg' or substring($mediaUri,string-length($mediaUri) - 2) = 'gif' or substring($mediaUri,string-length($mediaUri) - 2) = 'png' or substring($mediaUri,string-length($mediaUri) - 2) = 'bmp'">
        <img class="imageMedia" src="{$mediaUri}" alt="{$mediaAltText}"  title="{$mediaAltText}"/><p class="imageMediaBugFix"><em>
          <span></span>
        </em></p><!-- This prevents a weird IE table styling bug if an image element is the only content inside a td element. -->
			</xsl:when>
			<xsl:when test="substring($mediaUri,string-length($mediaUri) - 2) = 'swf'">
        <xsl:choose>
          <xsl:when test="/topic[@type = 'clickTableAnimation000']">
            <xsl:choose>
              <xsl:when test="$ActiveXObject!='' and $ActiveXObject!='true' ">
                <object class="flashMedia" width="100%" height="100%" type="application/x-shockwave-flash" data="{$mediaUri}">
                  <param name="movie" value="{$mediaUri}" />
                  <param name="PLAY" value="false" />
                </object>
              </xsl:when>
              <xsl:otherwise>
                <object class="flashMedia" width="100%" height="100%" type="application/x-shockwave-flash" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">
                  <param name="movie" value="{$mediaUri}" />
                  <param name="PLAY" value="false" />
                </object>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>
          <xsl:otherwise>
            <xsl:choose>
              <xsl:when test="$ActiveXObject!='' and $ActiveXObject!='true'">
                <object class="flashMedia" type="application/x-shockwave-flash" data="{$mediaUri}">
                  <param name="movie" value="{$mediaUri}" />
                </object>
              </xsl:when>
              <xsl:otherwise>
                <object class="flashMedia" type="application/x-shockwave-flash" data="{$mediaUri}" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">
                  <param name="movie" value="{$mediaUri}" />
                </object>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>
			</xsl:when>
			<xsl:when test="substring($mediaUri,string-length($mediaUri) - 2) = 'mht'">
				<iframe class="powerpointMedia" src="{$mediaUri}" frameborder="0"></iframe>
			</xsl:when>

			<xsl:when test="substring($mediaUri,string-length($mediaUri) - 2) = 'wmv' or substring($mediaUri,string-length($mediaUri) - 3) = 'xaml'">
        <xsl:choose>
          <xsl:when test="/topic[@type = 'clickTableAnimation000']">
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '1'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '2'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_2"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '3'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_3"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '4'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_4"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '5'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_5"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '6'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_6"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '7'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_7"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '8'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_8"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '9'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_9"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
            <xsl:choose>
              <xsl:when test="substring((./parent::*/@title), 5) = '10'">
                <xsl:copy-of select="$mediaPlayerSilverLightNodeTree_10"></xsl:copy-of>
              </xsl:when>
            </xsl:choose>
          </xsl:when>
          <xsl:otherwise>
            <xsl:copy-of select="$mediaPlayerSilverLightNodeTree"/>
          </xsl:otherwise>
        </xsl:choose>
			</xsl:when>

			<!--
			<xsl:when test="substring($mediaUri,string-length($mediaUri) - 2) = 'wmv'">
				<object class="wmvMedia" classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6" type="application/x-oleobject"
codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">
					<param name="autoStart" value="True"/>
					<param name="URL" value="{$mediaUri}"/>
				</object>
			</xsl:when>
			-->
		</xsl:choose>
	</xsl:template>


	<xsl:template match="//activity">
		<xsl:variable name="activityType" select="./@type"/>
    <xsl:variable name="activitySilverlightSupportSettingName">silverlight_<xsl:value-of select="$activityType"/>Supported</xsl:variable>
    <xsl:variable name="activitySilverlightSupported" select="document($gSettingsUri,/)//variable[@name = $activitySilverlightSupportSettingName]"/>
		<!-- If there is an overall question or scenario presented to the user, then render it. -->
		<xsl:choose>
			<xsl:when test="string-length(./question) &gt; '0'">
          <xsl:choose>
            <xsl:when test="($silverLightInstalled='true' and $activitySilverlightSupported='true') or ($silverlight_required='true' and $activitySilverlightSupported='true')">
              <!--For Sort, Adventure and Tile, overview screen is changed to Silverlight-->
              <xsl:if test="($activityType!='sortGame') and ($activityType!='adventure') and ($activityType!='tileFlip') and ($activityType!='dragAndDrop')">
                <div class="activityIntro" id="activityIntro">
					        <h3><xsl:value-of select="$activity_summaryHeading"/></h3>
					        <xsl:apply-templates select="./question"/>
                  <button title="{$activity_summaryButton}" onclick="this.parentNode.className = 'hidden'; {$activityType}.Page.prototype.startButtonClicked(); this.parentNode.parentNode.lastChild.firstChild.focus();">
                    <xsl:value-of select="$activity_summaryButton"/>
                  </button>
                </div>
              </xsl:if>
            </xsl:when>
            <!--For FlashCard, Overview screen is in Silverlight, and there is no Silverlight Suppported Setting. Do not show HTML screen-->
            <xsl:when test="($activityType='flashCard') or ($activityType='sequence')">
              
            </xsl:when>
            <xsl:otherwise>
              	<div class="activityIntro" id="activityIntro">
					        <h3><xsl:value-of select="$activity_summaryHeading"/></h3>
					        <xsl:apply-templates select="./question"/>
                  <button title="{$activity_summaryButton}" onclick="this.parentNode.className = 'hidden'; this.parentNode.parentNode.lastChild.Play();  this.parentNode.parentNode.lastChild.focus();">
                    <xsl:value-of select="$activity_summaryButton"/>
                  </button>
                </div>
            </xsl:otherwise>
          </xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<xsl:choose>
					<!-- There is no summary, but this is a sort game. -->
					<xsl:when test="$activityType='sortGame'">
              <xsl:choose>
                <xsl:when test="($silverLightInstalled='true' and $activitySilverlightSupported='true') or ($silverlight_required='true' and $activitySilverlightSupported='true')">
                    <!--Displayed in Silverlight-->
                </xsl:when>
                <xsl:otherwise>
                  <div class="activityIntro">
							        <h3><xsl:value-of select="$activity_summaryHeading"/></h3>
							        <div class="questionParent">
								        <div class="questionContent">
									        <p><xsl:apply-templates select="$sortGame_instructions"/></p>
								        </div>
							        </div>
                      <button title="{$activity_summaryButton}" onclick="this.parentNode.className = 'hidden'; this.parentNode.parentNode.lastChild.Play();  this.parentNode.parentNode.lastChild.focus();">
                      <xsl:value-of select="$activity_summaryButton"/>
                      </button>
                    </div>
                </xsl:otherwise>
              </xsl:choose>
						
					</xsl:when>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>

		<xsl:choose>
			<xsl:when test="($silverLightInstalled='true' and $activitySilverlightSupported='true') or ($silverlight_required='true' and $activitySilverlightSupported='true')">
				<xsl:choose>
					<xsl:when test="$activityType = 'captionMedia'">
						<xsl:copy-of select="$captionMediaSilverLightNodeTree" />
					</xsl:when>
					<xsl:when test="$activityType = 'adventure'">
						<xsl:copy-of select="$adventureSilverLightNodeTree" />
					</xsl:when>
					<xsl:when test="$activityType = 'sortGame'">
						<xsl:copy-of select="$sortGameSilverLightNodeTree" />
					</xsl:when>
					<xsl:when test="$activityType = 'tileFlip'">
						<xsl:copy-of select="$tileFlipSilverLightNodeTree" />
					</xsl:when>
					<xsl:when test="$activityType = 'dragAndDrop'">
						<xsl:copy-of select="$dragAndDropSilverLightNodeTree" />
					</xsl:when>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
        <xsl:choose>
          <xsl:when test="$activityType = 'interactiveJobAid'">
            <div class="interactiveJobAid">
              <xsl:copy-of select="$interactiveJobAidSilverLightNodeTree" />
            </div>
          </xsl:when>
          <xsl:when test="$activityType = 'flashCard'">
            <xsl:copy-of select="$flashCardSilverLightNodeTree" />
          </xsl:when>
          <xsl:when test="$activityType = 'sequence'">
            <xsl:copy-of select="$sequenceSilverLightNodeTree" />
          </xsl:when>
          <xsl:otherwise>
            <object class="{$activityType}" type="application/x-shockwave-flash" data="platform/interactive/definitions/{translate($activityType, $upperCaseUnicodeCharacters, $lowerCaseUnicodeCharacters)}.swf">
              <param name="movie" value="platform/interactive/definitions/{translate($activityType, $upperCaseUnicodeCharacters, $lowerCaseUnicodeCharacters)}.swf" />
              <param name="swliveconnect" value="true" />
              <param name="wmode" value="transparent" />
            </object>
          </xsl:otherwise>
        </xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

  <xsl:template match="/topic[@type='slider000']">
    <xsl:variable name="activityType" select="./activity/@type"/>
    <xsl:choose>
      <xsl:when test ="./activity/item/size/@value = 'small' and string-length(./activity/text) &gt; '0'">
        <div class = "sliderTextParent">
          <xsl:apply-templates select="./activity/text"/>
        </div>
      </xsl:when>
    </xsl:choose>   
    <div>
      <xsl:copy-of select="$sliderSilverLightNodeTree" />
    </div>
     </xsl:template>

	<!-- duplicate these formatting tags -->
	<xsl:template match="//strong">
		<strong><xsl:apply-templates/></strong>
	</xsl:template>
	<xsl:template match="//em">
		<em><xsl:apply-templates/></em>
	</xsl:template>
	<xsl:template match="//u">
		<u><xsl:apply-templates/></u>
	</xsl:template>
	<xsl:template match="//a">
		<xsl:choose>
			<!-- For vLabs. -->
			<xsl:when test="count(./ancestor::*[@type='labScenario000']) &gt; 0 and ./@href = 'vlab1' and $vmLab_support = 'true'">
				<button class="mediaLaunch" onclick="launchVlab('vlab1');">
					<xsl:choose>
						<xsl:when test="string-length(.) = 0">
							<xsl:value-of select="$button_launch"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:apply-templates/>
						</xsl:otherwise>
					</xsl:choose>
				</button>
			</xsl:when>
			<!-- For kona labs -->
			<xsl:when test="count(ancestor::*[@type='labScenario000']) &gt; 0 and substring(@href,1,8) = 'konalab(' and substring(@href, string-length(@href), 1) = ')' and $vmLab_support = 'true'">
				<xsl:variable name="labID" select="substring(./@href,9,string-length(./@href) - 9)"/>
				<button class="mediaLaunch" onclick="OnLabButtonClicked('{$labID}');">
					<xsl:choose>
						<xsl:when test="string-length(.) = 0">
							<xsl:value-of select="$button_launch"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:apply-templates/>
						</xsl:otherwise>
					</xsl:choose>
				</button>
			</xsl:when>
			<xsl:otherwise>
				<a target="_blank">
					<xsl:choose>
						<xsl:when test="string-length(./@uri) &gt; '0'">
							<xsl:attribute name="href"><xsl:value-of select="./@uri"/></xsl:attribute>
						</xsl:when>
						<xsl:otherwise>
							<xsl:choose>
								<xsl:when test="string-length(./@href) &gt; '0'">
									<xsl:attribute name="href"><xsl:value-of select="./@href"/></xsl:attribute>
								</xsl:when>
							</xsl:choose>
						</xsl:otherwise>
					</xsl:choose>

					<xsl:apply-templates/>
				</a>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//readeraid">
		<xsl:variable name="readeraidType" select="./@type"/>
		<xsl:variable name="readeraidTitle">
			<xsl:choose>
				<xsl:when test="$readeraidType = 'tip'"><xsl:value-of select="$readerAid_tip"/></xsl:when>
				<xsl:when test="$readeraidType = 'caution'"><xsl:value-of select="$readerAid_caution"/></xsl:when>
				<xsl:when test="$readeraidType = 'warning'"><xsl:value-of select="$readerAid_warning"/></xsl:when>
				<xsl:when test="$readeraidType = 'important'"><xsl:value-of select="$readerAid_important"/></xsl:when>
				<xsl:when test="$readeraidType = 'note'"><xsl:value-of select="$readerAid_note"/></xsl:when>
				<xsl:when test="$readeraidType = 'study_sheet'"><xsl:value-of select="$readerAid_studySheet"/></xsl:when>
			</xsl:choose>
		</xsl:variable>
		<div class="readeraid {$readeraidType}"><span class="readeraidTitle"><xsl:value-of select="$readeraidTitle"/></span><xsl:apply-templates/></div>
	</xsl:template>
	<xsl:template match="//ul">
		<ul><xsl:apply-templates/></ul>
	</xsl:template>
	<xsl:template match="//ol">
		<ol><xsl:apply-templates/></ol>
	</xsl:template>
	<xsl:template match="//li">
		<li>
			<xsl:choose>
				<xsl:when test="@index!='' and position()=1">
					<xsl:attribute name="value"><xsl:value-of select="@index"/></xsl:attribute>
				</xsl:when>

				<!-- Only continue numbering if this is the first li element within an ol whose parent is a text element. -->
				<xsl:when test="./parent::*[@type='continue'] and (./parent::*/parent::*[name()='text']) and position()=1">
					<!-- The first ol element preceding the current element that is not @type='continue'. -->
					<xsl:variable name="precedingRestartOL" select="./parent::*/preceding-sibling::*[name()='ol'][not(@type='continue')][position()=1]"/>
					<!-- The position of this ol element (in reference to other ol elements within this text element. -->
					<xsl:variable name="precedingRestartOLPosition" select="count($precedingRestartOL/preceding-sibling::*[name()='ol']) + 1"/>
					<!-- The position of this li element's parent ol element. -->
					<xsl:variable name="parentOLPosition" select="count(./parent::*/preceding-sibling::*[name()='ol']) + 1"/>
					<!-- Select all ol elements in between this li element's parent ol and the preceding ol that is not @type='continue'. -->
					<xsl:variable name="precedingContinuedOLs" select="./parent::*/preceding-sibling::*[name()='ol'][position() &gt;= $precedingRestartOLPosition and position() &lt; $parentOLPosition]"/>
					<!-- The number of li elements that exist within the ol elements preceding this li element in a 'continue' block. -->
					<xsl:variable name="continueOLStartingValue" select="count($precedingContinuedOLs/li) + 1"/>
					<xsl:attribute name="value"><xsl:value-of select="$continueOLStartingValue"/></xsl:attribute>
				</xsl:when>
			</xsl:choose>
			<xsl:apply-templates/>
		</li>
	</xsl:template>

	<!-- Account for text nodes missing a paragraph element to surround them.  This has to be below the //div handling templates but above everything else because it is looking for text nodes that slip through the cracks, it shouldn't override any other templates besides the div handling ones. -->
	<xsl:template match="//text()[not(ancestor::p)][parent::*[name()='text']]">
		<p><xsl:value-of select="."/></p>
	</xsl:template>

	<xsl:template match="//p">
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<p><xsl:apply-templates/></p>
			</xsl:when>
			<xsl:otherwise>
				<p><br /></p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//code">
		<code><xsl:apply-templates/></code>
	</xsl:template>


	<!-- template mask -->
	<xsl:template match="//audio"/>

</xsl:stylesheet>