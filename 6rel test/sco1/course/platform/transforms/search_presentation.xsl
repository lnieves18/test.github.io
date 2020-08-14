<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<!-- <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/> -->
	<!-- Isolate the current content page's language. -->
	<xsl:variable name="pageLanguage" select="/topic/@xml:lang"/>
	<!-- Define the location of the globalization strings. -->
	<xsl:variable name="gStringsUri">platform/localization/<xsl:value-of select="$pageLanguage"/>.xml</xsl:variable>
	<!-- Import the platform content from the localization xml file. -->
	<xsl:variable name="lowerCaseUnicodeCharacters">_</xsl:variable>
	<xsl:variable name="upperCaseUnicodeCharacters">_</xsl:variable>

	<xsl:variable name="multipleChoice_title"></xsl:variable>
	<xsl:variable name="multipleChoice_feedbackButton"></xsl:variable>
	<xsl:variable name="multipleChoice_questionSelect"></xsl:variable>
	<xsl:variable name="activity_summaryHeading"></xsl:variable>
	<xsl:variable name="activity_summaryButton"></xsl:variable>
	<xsl:variable name="notes_heading"></xsl:variable>
	<xsl:variable name="notes_deleteWarningMessage"></xsl:variable>
	<xsl:variable name="readerAid_tip"></xsl:variable>
	<xsl:variable name="readerAid_caution"></xsl:variable>
	<xsl:variable name="readerAid_warning"></xsl:variable>
	<xsl:variable name="readerAid_important"></xsl:variable>
	<xsl:variable name="readerAid_note"></xsl:variable>
	<xsl:variable name="readerAid_studySheet"></xsl:variable>
	<xsl:variable name="animation_transcriptHeader"></xsl:variable>
	<xsl:variable name="button_submit"></xsl:variable>
	<xsl:variable name="button_launch"></xsl:variable>
	<xsl:variable name="demonstration_windowTitle"></xsl:variable>
	<xsl:variable name="demonstration_transcriptPrint"></xsl:variable>
	<xsl:variable name="demonstration_transcriptPrintWindowTitle"></xsl:variable>
	<xsl:variable name="simulation_windowTitle"></xsl:variable>
	<xsl:variable name="simulation_transcriptPrint"></xsl:variable>
	<xsl:variable name="simulation_transcriptPrintWindowTitle"></xsl:variable>
	<xsl:variable name="introduction_moduleTitle"></xsl:variable>
	<xsl:variable name="notes_printPageTitle"></xsl:variable>
	<xsl:variable name="sortGame_instructions"></xsl:variable>
	<xsl:variable name="clickTable_instructions"></xsl:variable>

  <xsl:variable name="spacer" select="' '"></xsl:variable>
	<xsl:variable name="lessonTitle">
		<xsl:value-of select="topic/@title"/>
	</xsl:variable>
	<xsl:variable name="topicTitle">
		<xsl:value-of select="topic/@title"/>
	</xsl:variable>

	<xsl:template match="/">
		<html xml:lang="{$pageLanguage}" lang="{$pageLanguage}">
			<head>
				<meta http-equiv="content-type" content="application/xhtml+xml;charset=UTF-8"/>
				<script type="text/javascript" src="platform/ECMAScript/pageBehavior.js"></script>
				<script type="text/javascript" src="platform/ECMAScript/flashPageCommunication.js"></script>
				<script type="text/javascript" src="platform/ECMAScript/xmldom.js"></script>
				<link type="text/css" media="screen" rel="stylesheet" href="platform/styles/presentation.css"/>
				<title><xsl:value-of select="$lessonTitle"/></title>
			</head>
			<body>
				<!-- "true" if we should render the content wheel. -->
				<xsl:variable name="renderContentWheel">false</xsl:variable>

				<!-- CONTENT -->
				<div id="contentBlock">
					<xsl:attribute name="class">
						<xsl:choose>
							<xsl:when test="$renderContentWheel = 'true'">small</xsl:when>
							<xsl:otherwise>big</xsl:otherwise>
						</xsl:choose>
					</xsl:attribute>
					<div id="topBlock">
						<!-- Template name - only for "glossary000". -->
						<xsl:attribute name="class"><xsl:value-of select="//topic/@type"/></xsl:attribute>

						<h1><xsl:value-of select="$lessonTitle"/><xsl:value-of select="$spacer"/></h1>
						<div id="pageHeading">
							<h2><xsl:value-of select="$topicTitle"/><xsl:value-of select="$spacer"/></h2>
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
		<xsl:apply-templates select="./text"/>
	</xsl:template>

	<xsl:template match="/topic[@type='animation000']">
		<div class="animation">
			<h3><xsl:value-of select="$animation_transcriptHeader"/></h3>
			<xsl:apply-templates select="./text"/>
		</div>
	</xsl:template>

	<xsl:template match="/topic[@type='introduction000']">

		<xsl:choose>
			<!-- When there is any content for the double left div. -->
      <xsl:when test="string-length(//media/@uri) &gt; '0' and string-length(//audio/@uri) &gt; '0' and string-length(//audio/transcript) &gt; '0'">
        <div class="doubleLeft"><xsl:apply-templates select="./activity/media[1]/alt"></xsl:apply-templates></div>
        <div class="doubleLeft"><xsl:apply-templates select="//audio/transcript"></xsl:apply-templates><xsl:value-of select="$spacer"/></div>
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

  <!-- media With KeyPoints -->
  <xsl:template match="/topic[@type='media000']">
    <xsl:choose>
      <xsl:when test="string-length(//topic/activity/file/@uri) &gt; '0'">
      </xsl:when>
      <xsl:otherwise>
        <div class="staticKeyPoints">
          <xsl:apply-templates select="//text[2]"/>
        </div>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:choose>
      <xsl:when test="string-length(//topic/activity/text[1]) &gt; '0'">
        <div class="printLaunch">
          <xsl:apply-templates select="//topic/activity/text[1]"></xsl:apply-templates>
        </div>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

	<xsl:template match="/topic[@type='demo000']">
		<div class="doubleRight">
			<!-- informative text -->
			<p><xsl:apply-templates select="./text[1]"/></p>
    </div>
			<!-- the demo launch button -->
			<xsl:choose>
				<xsl:when test="string-length(./text[2]) &gt; '0'">
          <div class="printLaunch">
            <p><xsl:value-of select="/topic/text[2]"/></p>
          </div>
				</xsl:when>
			</xsl:choose>
	</xsl:template>


	<xsl:template match="/topic[@type='simulation000']">

		<div class="doubleRight">
			<!-- informative text -->
			<p><xsl:apply-templates select="./text[1]"/></p>
		</div>

			<!-- the simulation launch button -->
			<xsl:choose>
				<xsl:when test="string-length(./text[2]) &gt; '0'">
          <div class="printLaunch">
            <p><xsl:value-of select="//topic/text[2]"/></p>
          </div>
				</xsl:when>
			</xsl:choose>
	</xsl:template>

  <xsl:template match="/topic[@type='table000' or @type = 'clickTable000' or @type = 'textPictureTable000' or @type = 'clickTableAnimation000']">
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
      <xsl:value-of select="$spacer"/>
		</div>
		<xsl:apply-templates/>
	</xsl:template>

	<xsl:template match="/topic[@type='glossary000']">
		<xsl:choose>
			<xsl:when test="count(//definition) &gt; '0'">
				<ul id="glossaryNav">
					<xsl:for-each select="//definition[not(translate(substring(@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)=translate(substring(preceding-sibling::definition[1]/@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters))]">
						<xsl:sort select="@term"/>

						<xsl:variable name="indexTermLetter"><xsl:value-of select="translate(substring(./@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>
						<xsl:variable name="indexPrecedingTermLetter"><xsl:value-of select="translate(substring(preceding::definition/@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>

						<xsl:choose>
							<xsl:when test="$indexTermLetter != $indexPrecedingTermLetter">
								<li><a href="#{$indexTermLetter}"><xsl:value-of select="$indexTermLetter"/><xsl:value-of select="$spacer"/></a></li>
							</xsl:when>
						</xsl:choose>
					</xsl:for-each>
				</ul>

				<xsl:for-each select="//definition">
					<xsl:sort select="@term"/>

					<xsl:variable name="bodyTermLetter"><xsl:value-of select="translate(substring(./@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>
						<xsl:variable name="bodyPrecedingTermLetter"><xsl:value-of select="translate(substring(preceding::definition/@term, 1, 1), $lowerCaseUnicodeCharacters, $upperCaseUnicodeCharacters)"/></xsl:variable>

					<xsl:choose>
						<xsl:when test="$bodyTermLetter != $bodyPrecedingTermLetter">
							<a class="termLetter" id="{$bodyTermLetter}">.</a>
							<h3 class="termLetter"><xsl:value-of select="$bodyTermLetter"/><xsl:value-of select="$spacer"/></h3>
						</xsl:when>
					</xsl:choose>
					<h4 class="glossaryTerm"><xsl:value-of select="@term"/><xsl:value-of select="$spacer"/></h4>
					<xsl:apply-templates/>
				</xsl:for-each>
			</xsl:when>
		</xsl:choose>
	</xsl:template>


	<xsl:template match="//text">
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<div class="textParent"><xsl:apply-templates/><xsl:value-of select="$spacer"/></div>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//heading">
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<h3><xsl:apply-templates/><xsl:value-of select="$spacer"/></h3>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

	<!-- Multiple choice templates -->
	<xsl:template match="//assessment">
		<div class="assessment">
			<xsl:apply-templates/>
			<div class="assessmentFeedback">
				<div class="header"></div>
				<div class="body"></div>
				<div class="footer"><button onclick="this.parentNode.parentNode.setAttribute('className', 'assessmentFeedback hidden');"><xsl:value-of select="$multipleChoice_feedbackButton"/></button></div>
			</div>
		</div>
	</xsl:template>
	<xsl:template match="//item">
		<xsl:param name="itemPosition" select="position()"/>
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<div class="itemParent itemParent{$itemPosition}">
					<xsl:apply-templates>
						<xsl:with-param name="itemPos" select="position()"/>
					</xsl:apply-templates>
					<button disabled="true" class="submitButton"><xsl:value-of select="$button_submit"/></button>
				</div>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//question">
		<div class="questionParent">
			<div class="questionContent"><xsl:apply-templates/></div>
			<!-- If this is a multiple choice question. -->
			<xsl:choose>
				<xsl:when test="name(./parent::*/parent::*) = 'assessment'">
					<div class="questionDescription"><p><xsl:value-of select="$multipleChoice_questionSelect"/></p></div>
				</xsl:when>
			</xsl:choose>
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
						<p><xsl:apply-templates/><xsl:value-of select="$spacer"/></p>
					</div>
				</div>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	<xsl:template match="//feedback">
		<div class="feedbackParent">
			<xsl:apply-templates/><xsl:value-of select="$spacer"/>
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
        <xsl:when test="$tableType = 'click' or $tableType = 'clickTableAnimation' ">
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
	<xsl:template match="//list"><div class="list"><xsl:apply-templates/></div></xsl:template>
	<xsl:template match="//group">
		<xsl:param name="itemPos">1</xsl:param>
    <xsl:choose>
      <xsl:when test="parent::*/@title = 'Sliders'">
        <p><xsl:value-of select=".//alt"/></p>
        <p><xsl:value-of select=".//group[1]/alt"/></p>
        <p><xsl:value-of select=".//group[3]/alt[1]"/></p>
        <p><xsl:value-of select=".//group[3]/alt[2]"/></p>
      </xsl:when>
      <xsl:otherwise>
		<div class="group">
			<xsl:apply-templates>
				<xsl:with-param name="itemPos" select="$itemPos"/>
			</xsl:apply-templates>
		</div>
      </xsl:otherwise>
    </xsl:choose>
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
				<td class="pos{$tdPosition}"><div class="cellInner"><xsl:apply-templates/></div></td>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

  <!-- Activities templates-->
  <xsl:template match="//activity">
    <xsl:variable name="activityType" select="./@type"/>
    <xsl:choose>
      <xsl:when test="$activityType='sortGame' or $activityType = 'tileFlip' or $activityType='dragAndDrop' or $activityType = 'adventure' or $activityType = 'interactiveJobAid'">
          <div><xsl:apply-templates/></div>
        </xsl:when>
      <xsl:when test="$activityType = 'slider'">
          <div><xsl:apply-templates select="./question"/></div>
          <div><xsl:apply-templates select="./text"/></div>
        <div><xsl:apply-templates select="./list"/> </div>
        </xsl:when>
    </xsl:choose>
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
		<ul><xsl:apply-templates/><xsl:value-of select="$spacer"/></ul>
	</xsl:template>
	<xsl:template match="//ol">
		<ol><xsl:apply-templates/><xsl:value-of select="$spacer"/></ol>
	</xsl:template>
	<xsl:template match="//li">
		<li><xsl:apply-templates/><xsl:value-of select="$spacer"/></li>
	</xsl:template>
  <xsl:template match="//alt">
    <div><xsl:value-of select="."/><xsl:value-of select="$spacer"/></div>
	</xsl:template>
	<xsl:template match="//p">
		<xsl:choose>
			<xsl:when test="string-length(.) &gt; '0'">
				<p><xsl:apply-templates/><xsl:value-of select="$spacer"/></p>
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