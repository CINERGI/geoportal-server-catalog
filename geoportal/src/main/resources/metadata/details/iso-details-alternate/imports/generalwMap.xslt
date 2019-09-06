<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" 
xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
xmlns:res="http://www.esri.com/metadata/res/" 
xmlns:gmd="http://www.isotc211.org/2005/gmd"
exclude-result-prefixes="xsl res gmd" >

<!-- An XSLT template for displaying metadata in ArcGIS that is stored in the ArcGIS metadata format.

     Copyright (c) 2009-2010, Environmental Systems Research Institute, Inc. All rights reserved.
	
     Revision History: Created 3/19/2009 avienneau
-->

<!-- templates for adding portions of the header to the HTML page -->
<!-- SMR 2018: add styles and scripts from IEDA dataset landing pages to get map on page. 
    move google api key to private xslt that should be in git ignore in repository -->
  

<xsl:import href="private.xslt"/>
  
<xsl:output method="html" indent="yes" encoding="UTF-8"/>  
  
<xsl:template name="styles">
	<style type="text/css" id="internalStyle">
    body {
      font-family: Verdana, Gill, Helvetica, Sans-serif ;
      font-size: 0.8em;
      font-weight: 500;
      color: #000020;
      background-color: #FFFFFF;
    }
    div.itemDescription {
      margin-right: 2em;
      margin-bottom: 2em;
    }
    h1 {
      font-size: 1.5em;
      margin-top: 0;
      margin-bottom: 5px;
    }
    h1.idHeading {
      color: #008FAF;
      text-align: center;
    }
    h1.gpHeading {
      color: black;
    }
    span.idHeading {
      color: #007799;
      font-weight: bold;
    }
    .center {
      text-align: center;
      margin-top: 5px;
      margin-bottom: 5px;
    }
    img {
      width: 210px;
      border-width: 1px;
      border-style: outset;
    }
    img.center {
      text-align: center;
      display: block;
      border-color: #666666;
    }
    img.enclosed {
      width: 60%;
    }
    img.gp {
      width: auto;
      border-style: none;
    }
    .noThumbnail {
      color: #888888;
      font-size: 1.2em;
      text-align: center;
      width: 210px;
      height: 140px;
      border-width: 1px;
      border-style: solid;
      border-color: black;
      padding: 3em 3em;
      position: relative;
      direction: ltr;
      left: 50%;
      right: auto;
      margin-left: -127px;
    }
    .noContent {
      color: #888888;
    }
    div.box {
      border: thin inset #EEEEEE;
      margin-left: 1em;
      padding: 1em;
    }
    .box.arcgis {
      background-color: #F9FFFF;
    }
    .box.fgdc {
      background-color: #F0F5FF;
    }
    div.hide {
      display: none;
    }
    div.show {
      display: block;
    }
    span.hide {
      display: none;
    }
    span.show {
      display: inline-block;
    }
    .backToTop a {
      color: #DDDDDD;
      font-style: italic;
    }
    h2 {
      font-size: 1.2em;
    }
    h2.gp {
      color: #00709C;
    }
    .gpsubtitle {
      color: black;
      font-size: 1.2em;
	  font-weight: normal;
    }
    .gptags {
      color: black;
      font-size: 0.8em;
	  font-weight: normal;
    }
    .head {
      font-size: 1.3em;
    }
    a:link, a:visited {
      color: #004457;
      font-weight: normal;
      text-decoration: none;
    }
    a:link:hover, a:visited:hover {
      background-color: #FFFFD3;
    }
    h2.iso a {
      color: #007799;
      font-weight: bold;
    }
    h2.fgdc a {
      color: #004080;
      font-weight: bold;
    }
	h3 {
		font-size: 1em; 
		color: #00709C;
	}
    .backToTop {
      color: #AAAAAA;
      margin-left: 1em;
    }
    p.gp {
      margin-top: .6em;
      margin-bottom: .6em;
    }
    ul .gp {
      margin-left: -1em;
    }
    ul li.iso19139heading {
      margin-left: -3em;
	  list-style: none;
	  font-weight: bold;
    }
    dl {
      margin: 0;
      padding: 0;
    }
    dl.iso {
      background-color: #F2F9FF;
    }
    dl.esri {
      background-color: #F2FFF9;
    }
    dl.subtype {
      width: 40em;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      padding: 0;
    }
    dt {
      margin-left: 0.6em;
      padding-left: 0.6em;
      clear: left;
    }
    .subtype dt {
      width: 60%;
      float: left;
      margin: 0;
      padding: 0.5em 0.5em 0 0.75em;
      border-top: 1px solid #006400;
      clear: none;
    }
    .subtype dt.header {
      padding: 0.5em 0.5em 0.5em 0;
      border-top: none;
    }
    dd {
      margin-left: 0.6em;
      padding-left: 0.6em;
      clear: left;
    }
    .subtype dd {
      float: left;
      width: 25%;
      margin: 0;
      padding: 0.5em 0.5em 0 0.75em;
      border-top: 1px solid #006400;
      clear: none;
    }
    .subtype dd.header {
      padding: 0.5em 0.5em 0.5em 0;
      border-top: none;
    }
    .isoElement {
      font-variant: small-caps;
      font-size: 0.9em;
      font-weight: normal;
      color: #0000A0;
    }
    .esriElement {
      font-variant: small-caps;
      font-size: 0.9em;
      font-weight: normal;
      color: #006400;
    }
   <!-- color 444466 -->
    .element {
      font-variant: small-caps;
      font-size: 0.9em;
      font-weight: bold;
      color: #006400;
    }
    unknownElement {
      font-variant: small-caps;
      font-size: 0.9em;
      font-weight: normal;
      color: #333333;
    }
    .sync {
      color: #006400;
      font-weight: bold;
      font-size: 0.9em;
    }
    .code {
      font-family: monospace;
    }
    pre.wrap {
      width: 96%;
      font-family: Verdana, Gill, Helvetica, Sans-serif ;
      font-size: 1em;
      margin: 0 0 1em 0.6em;
      white-space: pre-wrap;       /* css-3 */
      white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
      white-space: -pre-wrap;      /* Opera 4-6 */
      white-space: -o-pre-wrap;    /* Opera 7 */
      word-wrap: break-word;       /* Internet Explorer 5.5+ */
    }
    pre.gp {
      font-family: Courier, Courier New, monospace;
      line-height: 1.2em;
      white-space: nowrap;
    }
    .gpcode {
      margin-left:15px;
      border: 1px dashed #ACC6D8;
      padding: 10px;
      background-color:#EEEEEE;
      height: auto;
      overflow: scroll; 
      width: 96%;
    }
    pre.gpOld {
      font-family: Courier, Courier New, monospace;
      line-height: 1.2em;
    }
    tr {
      vertical-align: top;
    }
    th {
      text-align: left;
      background: #dddddd;
      vertical-align: bottom;
      font-size: 0.8em;
    }
    td {
      background: #EEEEEE;
      color: black;
      vertical-align: top;
      font-size: 0.8em;
    }
  </style>

<!-- added styles -->
<!--  <link  rel="stylesheet" href="http://get.iedadata.org/metadata/iso/datadoi.css"/> apparently don't need???-->
  <!-- put style definition in line here, to avoid import location problems -->
  <style type="text/css" id="datadoi.css">
    /* 
    Created on : Feb 18, 2015, 1:07:47 PM
    Author     : vickiferrini
    * 
    smr 2018-05-03 minor updates for use with ISO metadata display
    * fix comment problems (change // to / * * /)
    */
    body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 15px;
    text-align: left;
    }
    #mapc {
    width: 320px;
    height: 320px;
    z-index: 1;
    }
    h1,h2 {
    margin-top: 0;
    margin-bottom: 5px;
    }
    /* smr 2018-05-03 make bigger font size */
    h1 {
    font-size: 200%;
    margin-left: 5px;
    padding-left: 5px;
    padding-top: 3px;
    padding-bottom: 2px;
    background-color: #D5D5D5;
    }
    #right-side {
    float: right;
    margin-left: 10px;
    }
    /* smr 2018-05-03 add */
    #left-side {
    float: left;
    margin-left: 10px;
    }
    img {
    padding-top: 5px;
    padding-bottom: 12px;
    }
    /*div.row:after {
    content: '';
    display: block;
    clear:both;
    }*/
    div.row {
    padding: 10px;
    position: relative;
    }
    
    div.description {
    font-size: 90%;
    margin-left: 150px;
    }
    
    .btn {
    margin-left: 150px;
    margin-top: 10px;
    /* max-width: 275px; */
    max-width: 200px;
    background: #3498db;
    background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
    background-image: -moz-linear-gradient(top, #3498db, #2980b9);
    background-image: -ms-linear-gradient(top, #3498db, #2980b9);
    background-image: -o-linear-gradient(top, #3498db, #2980b9);
    background-image: linear-gradient(to bottom, #3498db, #2980b9);
    -webkit-border-radius: 28;
    -moz-border-radius: 28;
    border-radius: 28px;
    font-family: Arial;
    color: #ffffff;
    font-size: 20px;
    padding: 5px 15px 5px 15px;
    text-decoration: none;
    }
    .btn:hover {
    background: #3cb0fd;
    background-image: -webkit-linear-gradient(top, #3cb0fd, #3498db);
    background-image: -moz-linear-gradient(top, #3cb0fd, #3498db);
    background-image: -ms-linear-gradient(top, #3cb0fd, #3498db);
    background-image: -o-linear-gradient(top, #3cb0fd, #3498db);
    background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
    text-decoration: none;
    }
    
    div.title {
    position: absolute;
    left:10px;
    top:10px;
    font-size: 95%;
    margin-left: 5px;
    /*     padding: 10px; */
    font-weight: bold;
    width: 150px;
    }
    
    #container {
    position: relative;
    min-width: 800px;
    }
  </style>
 



  <link rel="stylesheet" href="http://www.marine-geo.org/css/mapv3.css"/>
  <link rel="stylesheet" type="text/css"
    href="http://www.marine-geo.org/inc/jquery-ui-1.10.2.custom/css/smoothness/jquery-ui-1.10.2.custom.min.css"
    media="all"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous" />
</xsl:template>

<xsl:template name="scripts">
	<script type="text/javascript">
	/* <![CDATA[ */
		function hideShow(divID) {
			var item = document.getElementById(divID);
			var itemShow = document.getElementById(divID + 'Show');
			var itemHide = document.getElementById(divID + 'Hide');
			if (item) {
				if (item.className == 'hide') {
					item.className='show';
					itemShow.className='hide';
					itemHide.className='show';
				}
				else {
					item.className='hide';
					itemShow.className='show';
					itemHide.className='hide';
				}
			}
		}
	/* ]]> */


	</script>

<!-- 2018-05-01 added scripts for displaying result on map -->
  <!-- need to have workable Google maps API key. 
    generated by smrTucson@gmail.com 2018-06-01 for CINERGI ISO metadata
   -->
  <!-- for some reason, the script elements have to closed by a </script> tag, not just ../>
  otherwise the end of the element is not recognized. put in the <xsl:value-of select="string('')"/> 
  elements to force a closing tag  -->
  <!-- all the scripts (except the google api key handler are assumed to be in the same directory as the html document -->
<!--  <script src="http://maps.googleapis.com/maps/api/js?key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&amp;libraries=drawing" type="text/javascript">-->
  <script>
    <xsl:attribute name="src">
      <xsl:value-of select="concat(string('http://maps.googleapis.com/maps/api/js?key='),$googlemapapikey, string('&amp;libraries=drawing'))"/>
    </xsl:attribute>
    <xsl:attribute name="type">
      <xsl:value-of select = "string('text/javascript')"/>
    </xsl:attribute>
    <xsl:value-of select="string('')"/>
  </script>
  
  <!-- get scripts from http://get.iedadata.org/metadata/iso/ because when try from 132....169 at sdsc, it requires 
  user login authentication to access scripts -->
  <xsl:text>&#10;</xsl:text>                
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.js"><xsl:value-of select="string('')"/></script>
  <xsl:text>&#10;</xsl:text>                
  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.js"><xsl:value-of select="string('')"/></script>
  <xsl:text>&#10;</xsl:text>                
  <script type="text/javascript" src="http://get.iedadata.org/metadata/iso/basemap_v3.js"><xsl:value-of select="string('')"/></script>
  <xsl:text>&#10;</xsl:text> 
  <script type="text/javascript" src="http://get.iedadata.org/metadata/iso/doimap.js"><xsl:value-of select="string('')"/></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
            integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
  <xsl:text>&#10;</xsl:text> 

</xsl:template>

<!-- templates for handling different data types -->

<xsl:template name="booleanType">
	<xsl:param name="value" />
	<xsl:choose>
		<xsl:when test="($value = 1) or ($value = 'true') or ($value = 'TRUE') or ($value = 'True')"><res:boolTrue /></xsl:when>
		<xsl:when test="($value = 0) or ($value = 'false') or ($value = 'FALSE') or ($value = 'False')"><res:boolFalse /></xsl:when>
		<xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="dateType">
	<xsl:param name="value" />
	<xsl:choose>
		<xsl:when test="number($value)"><xsl:value-of select="substring($value,1,4)" /><xsl:if test="string-length($value) > 4">-<xsl:value-of select="substring($value,5,2)" /></xsl:if><xsl:if test="string-length($value) > 6">-<xsl:value-of select="substring($value,7,2)" /></xsl:if></xsl:when>
		<xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="timeType">
	<xsl:param name="value" />
	<xsl:choose>
		<xsl:when test="number($value)"><xsl:value-of select="substring($value,1,2)" /><xsl:if test="string-length($value) > 2">:<xsl:value-of select="substring($value,3,2)" /></xsl:if><xsl:if test="string-length($value) > 4">:<xsl:value-of select="substring($value,5,2)" /></xsl:if></xsl:when>
		<xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>
<!-- smr 2018-05-03, modify to catch https as well as http;
  also cludge to fix bad orcid URLs -->
<xsl:template name="urlType">
	<xsl:param name="value" />
	<xsl:choose>
		<xsl:when test="(substring($value,1,4) = 'http') or (substring($value,1,6) = 'ftp://')"><a target="viewer">
			<xsl:attribute name="href"><xsl:value-of select="$value"/></xsl:attribute>
			<xsl:value-of select="$value"/></a></xsl:when>
		<xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>

<!-- templates for handling large blocks of text, e.g. abstract -->

<xsl:template name="handleURLs">
	<xsl:param name="text" />
	<xsl:variable name="replaceURL">http://</xsl:variable>
	
	<xsl:choose>
		<xsl:when test="contains($text, $replaceURL)">
			<xsl:variable name="before" select="substring-before($text, $replaceURL)" />
			<xsl:variable name="middle" select="substring-after($text, $replaceURL)" />
			
			<xsl:variable name="url" select="substring-before($middle, ' ')" />
			<xsl:variable name="after" select="substring-after($middle, $url)" />
		
			<xsl:choose>
				<xsl:when test='$after'>
					<xsl:value-of select='$before'/><a target="viewer">
						<xsl:attribute name="href"><xsl:value-of select='$replaceURL' /><xsl:value-of select='$url' /></xsl:attribute>
						<xsl:value-of select='$replaceURL' /><xsl:value-of select='$url' />
					</a>
					
					<xsl:call-template name="handleURLs">
						<xsl:with-param name="text" select="$after" />
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$text" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$text" />
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="fixWhiteSpace">
	<xsl:param name="ws" />
	<xsl:variable name="replaceCR">&#xa;</xsl:variable>
	
	<xsl:choose>
		<xsl:when test="contains(string($ws), $replaceCR)">
	
			<xsl:variable name="first" select="substring-before($ws, $replaceCR)" />
			<xsl:variable name="rest" select="substring-after($ws, $replaceCR)" />
			
			<p>
				<xsl:call-template name="handleURLs">
					<xsl:with-param name="text" select="$first" />
				</xsl:call-template>
			</p>
			
			<xsl:call-template name="fixWhiteSpace">
				<xsl:with-param name="ws" select="$rest" />
			</xsl:call-template>

		</xsl:when>
		<xsl:otherwise>
			<p>
				<xsl:call-template name="handleURLs">
					<xsl:with-param name="text" select="$ws" />
				</xsl:call-template>
			</p>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="removeMarkup">
	<xsl:param name="text" />
	<xsl:variable name="lessThan">&lt;</xsl:variable>
	<xsl:variable name="greaterThan">&gt;</xsl:variable>
	
	<xsl:choose>
		<xsl:when test="contains($text, $lessThan)">
			<xsl:variable name="before" select="substring-before($text, $lessThan)" />
			<xsl:variable name="middle" select="substring-after($text, $lessThan)" />
			<xsl:variable name="after" select="substring-after($middle, $greaterThan)" />
		
			<xsl:choose>
				<xsl:when test='$middle'>
					<xsl:value-of select='$before'/>
					<xsl:call-template name="removeMarkup">
						<xsl:with-param name="text" select="$after" />
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$text" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$text" />
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="fixHTML">
	<xsl:param name="text" />
	<xsl:variable name="lessThan">&lt;</xsl:variable>
	<xsl:variable name="greaterThan">&gt;</xsl:variable>
	
	<xsl:choose>
		<xsl:when test="contains($text, $lessThan)">
			<xsl:variable name="before" select="substring-before($text, $lessThan)" />
			<xsl:variable name="middle" select="substring-after($text, $lessThan)" />
			<xsl:variable name="after" select="substring-after($middle, $greaterThan)" />
		
			<xsl:choose>
				<xsl:when test='$middle'>
					<xsl:value-of select='$before'/>
					<xsl:text> </xsl:text>
					<xsl:call-template name="fixHTML">
						<xsl:with-param name="text" select="$after" />
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$text" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$text" />
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="arcgisElement">
	<xsl:param name="ele" />
	<dt><xsl:if test="$ele/@Sync = 'TRUE'">
		<span class="sync">*</span>&#x2009;</xsl:if><span class="esriElement">
			<xsl:call-template name="elementText">
				<xsl:with-param name="ele" select="$ele" />
			</xsl:call-template>
		</span>&#x2003;<xsl:value-of select="$ele"/></dt>
</xsl:template>

<xsl:template name="elementText">
	<xsl:param name="ele" />
	<xsl:variable name="eleName"><xsl:value-of select="local-name($ele)" /></xsl:variable>
	<xsl:choose>
		<!-- ESRI Raster Properties General -->
		<xsl:when test="($eleName = 'PixelDepth')"><res:idPixDepth/></xsl:when>
		<xsl:when test="($eleName = 'HasColormap')"><res:idHasColmap/></xsl:when>
		<xsl:when test="($eleName = 'CompressionType')"><res:idCompressionType/></xsl:when>
		<xsl:when test="($eleName = 'NumBands')"><res:idNumBands/></xsl:when>
		<xsl:when test="($eleName = 'Format')"><res:idRasterFmt/></xsl:when>
		<xsl:when test="($eleName = 'HasPyramids')"><res:idHasPyramids/></xsl:when>
		<xsl:when test="($eleName = 'SourceType')"><res:idSrcType/></xsl:when>
		<xsl:when test="($eleName = 'PixelType')"><res:idPixType/></xsl:when>
		<xsl:when test="($eleName = 'NoDataValue')"><res:idNoDataVal/></xsl:when>
		<!-- ESRI Raster Mosaic Properties -->
		<xsl:when test="($eleName = 'MaxImageHeight')"><res:idMaxImageHeight /></xsl:when>
		<xsl:when test="($eleName = 'MaxImageWidth')"><res:idMaxImageWidth /></xsl:when>
		<xsl:when test="($eleName = 'MaxRecordCount')"><res:idMaxRecordCount /></xsl:when>
		<xsl:when test="($eleName = 'MaxDownloadImageCount')"><res:idMaxDownloadImageCount /></xsl:when>
		<xsl:when test="($eleName = 'MaxMosaicImageCount')"><res:idMaxMosaicImageCount /></xsl:when>
		<xsl:when test="($eleName = 'ViewpointSpacingX')"><res:idViewpointSpacingX /></xsl:when>
		<xsl:when test="($eleName = 'ViewpointSpacingY')"><res:idViewpointSpacingY /></xsl:when>
		<xsl:when test="($eleName = 'DefaultCompressionQuality')"><res:idDefaultCompressionQuality /></xsl:when>
		<xsl:when test="($eleName = 'DefaultResamplingMethod')"><res:idDefaultResamplingMethod /></xsl:when>
		<xsl:when test="($eleName = 'AllowedItemMetadata')"><res:idAllowedItemMetadata /></xsl:when>
		<xsl:when test="($eleName = 'AllowedMosaicMethods')"><res:idAllowedMosaicMethods /></xsl:when>
		<xsl:when test="($eleName = 'AllowedCompressions')"><res:idAllowedCompressions /></xsl:when>
		<xsl:when test="($eleName = 'AllowedFields')"><res:idAllowedFields /></xsl:when>
		<xsl:when test="($eleName = 'AvailableVisibleFields')"><res:idAvailableVisibleFields /></xsl:when>
		<xsl:when test="($eleName = 'AvailableMosaicMethods')"><res:idAvailableMosaicMethods /></xsl:when>
		<xsl:when test="($eleName = 'AvailableCompressionMethods')"><res:idAvailableCompressionMethods /></xsl:when>
		<xsl:when test="($eleName = 'AvailableItemMetadataLevels')"><res:idAvailableItemMetadataLevels /></xsl:when>
		<xsl:when test="($eleName = 'ConfigKeyword')"><res:idConfigKeyword /></xsl:when>
		<!-- ESRI Reference System Details -->
		<xsl:when test="($eleName = 'XOrigin')"><res:XOrigin/></xsl:when>
		<xsl:when test="($eleName = 'YOrigin')"><res:YOrigin/></xsl:when>
		<xsl:when test="($eleName = 'XYScale')"><res:XYScale/></xsl:when>
		<xsl:when test="($eleName = 'ZOrigin')"><res:ZOrigin/></xsl:when>
		<xsl:when test="($eleName = 'ZScale')"><res:ZScale/></xsl:when>
		<xsl:when test="($eleName = 'MOrigin')"><res:MOrigin/></xsl:when>
		<xsl:when test="($eleName = 'MScale')"><res:MScale/></xsl:when>
		<xsl:when test="($eleName = 'XYTolerance')"><res:XYTolerance/></xsl:when>
		<xsl:when test="($eleName = 'ZTolerance')"><res:ZTolerance/></xsl:when>
		<xsl:when test="($eleName = 'MTolerance')"><res:MTolerance/></xsl:when>
		<xsl:when test="($eleName = 'HighPrecision')"><res:HighPrecision/></xsl:when>
		<xsl:when test="($eleName = 'LeftLongitude')"><res:LeftLongitude/></xsl:when>
		<xsl:when test="($eleName = 'WKID')"><res:WKID/></xsl:when>
		<xsl:when test="($eleName = 'WKT')"><res:WKT/></xsl:when>
		<xsl:otherwise><span class="unknownElement"><xsl:value-of select="$eleName" /></span></xsl:otherwise>
	</xsl:choose>
</xsl:template>

</xsl:stylesheet>