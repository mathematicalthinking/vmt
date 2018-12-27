const INITIAL_XML = `
<?xml version="1.0" encoding="utf-8"?>
<geogebra format="5.0" version="5.0.514.0" app="classic" platform="w" id="73A0DC1E-E9EE-4FA9-8111-F486CFFAD679"  xsi:noNamespaceSchemaLocation="http://www.geogebra.org/ggb.xsd" xmlns="" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >
<gui>
	<window width="100%" height="100%" />
	<perspectives>
<perspective id="tmp">
	<panes>
		<pane location="" divider="0.3295750216825672" orientation="1" />
	</panes>
	<views>
		<view id="4097" visible="false" inframe="false" stylebar="true" location="1,1,1,1" size="400" window="100,100,700,550" />
		<view id="512" toolbar="0 | 1 501 5 19 , 67 | 2 15 45 18 , 7 37 | 514 3 9 , 13 44 , 47 | 16 | 551 550 11 ,  20 22 21 23 , 55 56 57 , 12 | 69 | 510 511 , 512 513 | 533 531 , 534 532 , 522 523 , 537 536 , 535 | 521 520 | 36 , 38 49 560 | 571 30 29 570 31 33 | 17 | 540 40 41 42 , 27 28 35 , 6 , 502" visible="false" inframe="false" stylebar="false" location="1,1,1" size="500" window="100,100,600,400" />
		<view id="4" toolbar="0 || 2020 , 2021 , 2022 || 2001 , 2003 , 2002 , 2004 , 2005 || 2040 , 2041 , 2042 , 2044 , 2043" visible="false" inframe="false" stylebar="false" location="1,1" size="300" window="100,100,600,400" />
		<view id="8" toolbar="1001 | 1002 | 1003  || 1005 | 1004 || 1006 | 1007 | 1010 || 1008 | 1009 || 6" visible="false" inframe="false" stylebar="false" location="1,3" size="300" window="100,100,600,400" />
		<view id="1" visible="true" inframe="false" stylebar="false" location="1" size="766" window="100,100,600,400" />
		<view id="2" visible="true" inframe="false" stylebar="false" location="3" size="380" window="100,100,600,400" />
		<view id="16" visible="false" inframe="false" stylebar="false" location="1" size="300" window="50,50,500,500" />
		<view id="32" visible="false" inframe="false" stylebar="true" location="1" size="300" window="50,50,500,500" />
		<view id="64" toolbar="0" visible="false" inframe="false" stylebar="false" location="1" size="480" window="50,50,500,500" />
		<view id="128" visible="false" inframe="false" stylebar="false" location="1" size="480" window="50,50,500,500" />
		<view id="70" toolbar="0 || 2020 || 2021 || 2022" visible="false" inframe="false" stylebar="true" location="1" size="900" window="50,50,500,500" />
		<view id="43" visible="false" inframe="false" stylebar="false" location="1" size="450" window="50,50,500,500" />
	</views>
	<toolbar show="false" items="0 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6" position="1" help="false" />
	<input show="true" cmd="true" top="algebra" />
	<dockBar show="false" east="false" />
</perspective>
	</perspectives>
	<labelingStyle  val="0"/>
	<font  size="16"/>
</gui>
<euclidianView>
	<viewNumber viewNo="1"/>
	<size  width="765" height="637"/>
	<coordSystem xZero="382.5" yZero="318.5" scale="50" yscale="50"/>
	<evSettings axes="true" grid="true" gridIsBold="false" pointCapturing="3" rightAngleStyle="1" checkboxSize="26" gridType="3"/>
	<bgColor r="255" g="255" b="255"/>
	<axesColor r="0" g="0" b="0"/>
	<gridColor r="192" g="192" b="192"/>
	<lineStyle axes="1" grid="0"/>
	<axis id="0" show="true" label="" unitLabel="" tickStyle="1" showNumbers="true"/>
	<axis id="1" show="true" label="" unitLabel="" tickStyle="1" showNumbers="true"/>
</euclidianView>
<algebraView>
	<mode val="3"/>
</algebraView>
<kernel>
	<continuous val="false"/>
	<usePathAndRegionParameters val="true"/>
	<decimals val="2"/>
	<angleUnit val="degree"/>
	<algebraStyle val="3" spreadsheet="0"/>
	<coordStyle val="0"/>
</kernel>
<tableview min="-2" max="2" step="1"/>
<scripting blocked="false" disabled="false"/>
<construction title="" author="" date="">
</construction>
</geogebra>`

export default INITIAL_XML;