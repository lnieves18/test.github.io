var mouseCheckInt
var updateScrubberInt
var scrollLeftRightInt
var scrollUpDownInt
var _root_xmouse
var _root_ymouse
var curScrollPanel=null
var scrollPanelArr=new Array()
var bulletCharacter = "\u2022"; 
var isMouseDown ;
var globalObject;
var mouseMove ;
var scrolling_down;
var scrolling_up;

//Scrolls the text by dragging the scrollbar
// Param1: sender object
// Param2: event argument
function startDrag(s,e) 
{
	try
	{
	    this.mouse_down=1
	    sender=s
	    me=this
    	
	    var key=s.name.split("_")[0]
	    obj=scrollPanelArr[key]
    	
	    obj.click_x=e.getPosition(s).x	
	    obj.click_y=e.getPosition(s).y	
	    //this if condition is added to prevent the scrollbar up-down movement when obj.click_y = 0
	    if(obj.click_y > 0)
	    {
	        if(obj.scrollTween) 
	        {
		        obj.scrollTween.stop()
	        }	

	        obj.mouseCheckInt=setInterval("mouseChecker(sender,me,obj)",10)	
	        s.captureMouse()
	    }
	    s.SetValue("Fill","#FFA1B4DF");
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Sets the flag when the mouse is moved over the scrollbar
// Param1: sender object
// Param2: event object
function continueDrag(s,e)
{
   try
   {
       if(this.mouse_down == 1)
       {
            mouseMove = true;
       }
       else
       {
            mouseMove = false;
       }
    }
    catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Stops scrolling of text and scrollbar once the mouse click is released after dragging
// Param1: sender object
// Param2: event object
function endDrag(s,e) 
{
	try
	{
	    this.mouse_down=0
	    isMouseDown = false;
        scrolling_down = false;
        scrolling_up = false;
	    var key=s.name.split("_")[0]
	    var obj=scrollPanelArr[key]	
	    clearInterval(obj.mouseCheckInt)
	    s.releaseMouseCapture()
	    
	    var mousePosition_x = e.getPosition(s).x
            s.SetValue("Fill","#FFB9CBF9");
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Called for scrolling the text when the scrollbar is dragged
// Param1: sender object
// Param2: event object
// Param3: the textarea object 
function mouseChecker(s,me,obj) 
{
    try
    {
	    if(me.mouse_down) 
	    {
            if(mouseMove == true)
            {
		        if(obj.direction=="H") 
		        {
			        new_val=_root_xmouse-obj.world_offset+obj.local_offset-obj.click_x
			        calc_scroll_end=obj.track_length+obj.local_offset-s.width
			        //equates to...
			        //var calc_right_edge=(obj.track_length+obj.world_offset)-(obj.world_offset-obj.local_offset)-s.width
        		
			        val=((new_val-obj.start_scroll)/(obj.track_length-s.width))*100
			        per=val/100
			        canvas_prop="Canvas.Left"
		        }
		        else 
		        {
			        new_val=_root_ymouse-obj.world_offset+obj.local_offset-obj.click_y
			        calc_scroll_end=obj.track_length+obj.local_offset-s.height
        		
			        val=((new_val-obj.start_scroll)/(obj.track_length-s.height))*100
			        per=val/100
			        canvas_prop="Canvas.Top"			
		        }
        		
		        if(new_val>obj.start_scroll && new_val<calc_scroll_end) 
		        {
			        s[canvas_prop]=new_val
			        s.findName(obj.container)[canvas_prop]=((obj.content_length - obj.mask_length)*per)*-1
		        }
		        else if(new_val<=obj.start_scroll) 
		        {
			        s[canvas_prop]=obj.start_scroll
			        s.findName(obj.container)[canvas_prop]=0
		        }
		        else if(new_val>=calc_scroll_end) 
		        {
			        s[canvas_prop]=calc_scroll_end
			        s.findName(obj.container)[canvas_prop]=-obj.content_length+obj.mask_length
		        }
            }
	    }
	    else 
	    {
		    clearInterval(obj.mouseCheckInt)
		    s.releaseMouseCapture()
	    }
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}
//Implements multiple scrolls for page up/page down functionalities
// Param1: sender object
// Param2: event object
// Param3: diff 
function pageScrollUpDownCapture(s,e,diff)
{
    try
    {
        sender = s
        eventObj = e
        difference = diff
        isMouseDown = true;
        var key=s.name.split("_")[0]
	    var obj=scrollPanelArr[key]
	    this.pressTrackBar(sender,eventObj,difference)
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Called when the mouse is released after clicking on the trackbar
// Param1: sender object
function pageScrollUpDownRelease(s)
{
    try
    {
        this.mouse_down=0;
        isMouseDown = false;
        scrolling_down = false;
        scrolling_up = false;
        var key=s.name.split("_")[0]
	    var obj=scrollPanelArr[key] 
        clearInterval(obj.scrollUpDownInt)
    }
    catch(err)
	{
	    //TO DO: Throw error message.
	}
}
//Called to scroll the text when the trackbar is clicked
// Param1: sender object
// Param2: event object
// Param3: diff 
function pressTrackBar(s,e,diff) 
{
	try
	{
	    if(isMouseDown == true)
	    {
	        key=s.name.split("_")[0]

	        var obj=scrollPanelArr[key]
	        var time_to_scroll
	        var click_x
	        var click_y
	        var click_prop
	        var scrubber_prop
	        var new_val
	        var mouse_ypos_scrubber
        	
	        globalObject = this;
	        senderObj = s;
	        eventObj = e;
	        var	scrubber=s.findName(key+"_Scrubber")
        	
	        if(e) 
	        { // if event came from trackbar press
		        if(s.getParent() != null)
		        {
		            click_x=e.getPosition(s).x
		            click_y=e.getPosition(s).y
		        }
        	
		        //on track bar press - time for scroll bar animation
		        time_to_scroll = 0.01
	        }
	        else 
	        { //else event came from mouse wheel
        	
		        time_to_scroll = 0.0001  //on mouse wheel scroll - time for scroll bar animation
        		
		        var scroll_amount=1
        		
		        if(diff>0) 
		        {
			        click_y=(scrubber["Canvas.Top"]-obj.local_offset)-scroll_amount
		        }
		        else 
		        {	
			        click_y=(scrubber["Canvas.Top"]-obj.local_offset+scrubber.height)+scroll_amount
		        }
        		
		        if(click_y<0) 
		        {
			        click_y=0
		        }
		        else if(click_y>obj.track_length) 
		        {
			        click_y=obj.track_length
		        }
	        }
        	
    	    if((click_x != null && click_x != "undefined") && (click_y != null && click_y != "undefined"))
    	    {
    	        if(obj.direction=="H") 
    	        {
		            click_prop=click_x
		            canvas_prop="Canvas.Left"
		            scrubber_prop=scrubber.width
	            }
	            else 
	            {
		            click_prop=click_y
		            canvas_prop="Canvas.Top"
		            scrubber_prop=scrubber.height
	            }
            	
	            //handles muliptle trackbar clicks
	            if(obj.scrollTween) 
	            {
		            obj.scrollTween.stop()
	            }
    	        mouse_ypos_scrubber = e.getPosition(scrubber).y
	            //for scroll up
	            if(click_prop < scrubber[canvas_prop] - obj.local_offset) 
	            {
	                var diff = scrubber[canvas_prop] - click_prop;
        	        
	                var scrollUpAmount = 15;
	                if(scrolling_down == true)
	                {
	                    if(0 < mouse_ypos_scrubber && mouse_ypos_scrubber <= scrubber["Height"])
	                    {
	                       if(diff > 20)
	                        {
	                            click_prop = scrubber[canvas_prop] - obj.local_offset - scrollUpAmount; //5
	                        }
	                        if(scrubber[canvas_prop] - scrollUpAmount <=(s[canvas_prop] + obj.local_offset))
	                        {
	                            obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(obj.local_offset),time_to_scroll)
	                            //added to prevent the simultaneous up-down movement of the scrollbar
	                            isMouseDown = false;
	                        }
	                        else
	                        {
	                            obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(click_prop+obj.local_offset),time_to_scroll)
	                        }
	                        scrolling_up = true;
	                    }
	                }
	                else
	                {
	                    if(diff > 20)
	                    {
	                        click_prop = scrubber[canvas_prop] - obj.local_offset - scrollUpAmount; //5
	                    }
	                    if(scrubber[canvas_prop] - scrollUpAmount <= obj.local_offset)
	                    {
	                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(obj.local_offset),time_to_scroll)
	                        //added to prevent the simultaneous up-down movement of the scrollbar
	                        isMouseDown = false;
	                    }
	                    else
	                    {
	                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(click_prop+obj.local_offset),time_to_scroll)
	                    }
	                     scrolling_up = true;
	                }
	            }
	            //for scroll down
	            else 
	            {
	                var diff = click_prop + s[canvas_prop]- scrubber[canvas_prop] + scrubber_prop;
	                var scrollDownAmount = 15;
	                if(scrolling_up != true)
	                {
	                        if(diff >= 0)
	                        {
	                            if(diff >= 3)
	                            {
	                               if(click_prop + s[canvas_prop] > (scrubber[canvas_prop] + scrubber_prop))
	                               {
	                                   if(scrubber[canvas_prop]+scrubber_prop + scrollDownAmount <= (obj.local_offset+obj.track_length))
	                                   {
	                                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],scrubber[canvas_prop] + scrollDownAmount,time_to_scroll)
	                                   }
	                                   else
	                                   {
	                                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(obj.local_offset+obj.track_length - scrubber_prop) ,time_to_scroll)
	                                        isMouseDown = false;
	                                   }
	                               }
	                            }
	                            else  
	                            {
	                                obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(click_prop-scrubber_prop+obj.local_offset),time_to_scroll)
	                            }
	                            scrolling_down = true
	                        }
	                }
	            }
            	
	            if(obj.scrollTween != null) 
	            {
    	            obj.scrollTween.onMotionChanged = function(event)
    	            {
		                scrubber[canvas_prop] = event.target._pos
                		
		                new_val=event.target._pos

		                if(obj.direction=="H") 
		                {
			                val=((new_val-obj.start_scroll)/(obj.track_length-scrubber.width))*100
			                canvas_prop="Canvas.Left"
		                }
		                else 
		                {
			                val=((new_val-obj.start_scroll)/(obj.track_length-scrubber.height))*100
			                canvas_prop="Canvas.Top"
		                }
		                var per=val/100
		                s.findName(obj.container)[canvas_prop]=((obj.content_length - obj.mask_length)*per)*-1	
	                }
	                obj.scrollTween.start()
	            }
                obj.scrollTween = null;	
                setTimeout('globalObject.pressTrackBar(senderObj,eventObj,null)', 25); 
    	    }
        }
    }
    catch(err)
    {
        //TO DO: Throw error message.
    }
}

//scrolls the text by clicking on the up/down rectangles
// Param1: sender object
function scrollerArrowPress(s) 
{
	try
	{
	    sender=s
    	
	    var key=s.name.split("_")[0]
	    var obj=scrollPanelArr[key]
    	
	    if(obj.scrollTween) 
	    {
		    obj.scrollTween.stop()
	    }	
    	
	    if(obj.direction=="H") 
	    {
		    //scrollLeftRightInt=setInterval("scrollLeftRight(sender,me)",10)
	    }
	    else 
	    {
	        //this amount has been changed from 30 to 1 in order to reduce flickering effect on continuous up/down arrow click
		    obj.scrollUpDownInt=setInterval("scrollUpDown(sender)",1) 
	    }
	    s.captureMouse()
	    
	    s.children.getItem(0).SetValue("Fill","#FFA1B4DF");
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Called when the mouse click is released on the up/down rectangles
// Param1: sender object
// Param2: event object
function scrollerArrowRelease(s,e) 
{
    try
    {
	    var key=s.name.split("_")[0]
	    var obj=scrollPanelArr[key]
	    clearInterval(obj.scrollUpDownInt)
	    s.releaseMouseCapture()
	    
	    var mousePosition_x = e.getPosition(s).x
            s.children.getItem(0).SetValue("Fill","#FFB9CBF9");
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Called when the mouse is clicked on the up/down rectangles
// Param1: sender object
function scrollUpDown(s) 
{
    try
    {
	    var key=s.name.split("_")[0]
	    var btn_name=s.name.split("_")[1]
	    var obj=scrollPanelArr[key]
    	
	    scrubber=s.findName(key+"_Scrubber")
    	
	    var scroll_amount=obj.scroll_amount
	    if(scrubber["Height"] <= 3)
	    {
	        scroll_amount = 0.026 ; 
	    }
	    //for scroll up
	    if(btn_name=="Up") 
	    {
    	
		    var pre_check=scrubber["Canvas.Top"]-scroll_amount
    		
		    if(pre_check>obj.local_offset) 
		    {
			    scrubber["Canvas.Top"]=scrubber["Canvas.Top"]-scroll_amount
		    }
		    else 
		    {
			    scrubber["Canvas.Top"]=obj.local_offset
		    }
	    }
	    //for scroll down
	    else 
	    {
    		
		    var calc_bottom_edge=obj.track_length+obj.local_offset-scrubber.height
    		
		    var pre_check=scrubber["Canvas.Top"]+scroll_amount
    		
		    if(pre_check<calc_bottom_edge) 
		    {
			    scrubber["Canvas.Top"]=scrubber["Canvas.Top"]+scroll_amount
		    }
		    else
		    {
			    scrubber["Canvas.Top"]=calc_bottom_edge
		    }
	    }
	    updatePanel(scrubber["Canvas.Top"],s,obj)
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}
//Called from the scrollUpDown function to scroll text proportionately with the scrollbar
//Param1: new_val- intermediate value used for position calculation
//Param2: sender object
//Param3: textarea object
function updatePanel(new_val,s,obj) 
{
	try
	{
	    var scroll_width=s.findName(obj.container).width
	    key=s.name.split("_")[0]
    	
	    scrubber=s.findName(key+"_Scrubber")
    	
	    //duplicate code as in "mouseChecker", should consolidate into new function
	    if(obj.direction=="H") 
	    { 		
	        val=((new_val-obj.start_scroll)/(obj.track_length-scrubber.width))*100
		    canvas_prop="Canvas.Left"
	    }
	    else 
	    {
		    val=((new_val-obj.start_scroll)/(obj.track_length-scrubber.height))*100
		    canvas_prop="Canvas.Top"
	    }
	    var per=val/100
	    var resetValue = ((obj.content_length - obj.mask_length)*per)*-1
	    if(resetValue != 'NaN')
	    {
	        s.findName(obj.container)[canvas_prop] = resetValue 
	    }
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Called from the scrollUpDown function to scroll text proportionately with the scrollbar
//Param1: sender object
//Param2: event object
function whenMouseMoves(s, e)
 {
    try
    {
        _root_xmouse = e.getPosition(null).x
        _root_ymouse = e.getPosition(null).y
    }
    catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Creates a single instance of the scrollbar
//Param1: name of the object to be created
//Param2: canvas where object is to be placed after creation
//Param3: left coordinate for the object to be created
//Param4: top coordinate for the object to be created
//Param5: width of the object to be created
//Param6: height the object to be created
//Param7: scrolling direction for the control
//Param8: content of text to be displayed
//Param9: color of the text
//Param10: size of the text
//Param11:font family for the text
//Param12: background color for the control
//Param13: format type for the text
function createScrollablePanel(name,parentCanvas,xpos,ypos,wid,hgt,dir,fill_text,text_color,text_size,text_font,bg_color,formatType) 
{
    try
    {
	    this.name=name
	    this.xpos=xpos
	    this.ypos=ypos
	    this.width=wid
	    this.height=hgt
	    this.fill_text=fill_text
	    this.direction=dir
       
	    this.text_color="#000"
	    if(text_color) 
	    {
		    this.text_color=text_color
	    }
    	
	    this.text_size=10
	    if(text_size) 
	    {
		    this.text_size=text_size
	    }
    	
	    this.text_font="Verdana"
	    if(text_font) 
	    {
		    this.text_font=text_font
	    }	

	    this.bg_color="transparent"
	    if(bg_color) 
	    {
		    this.bg_color=bg_color
	    }
    	
	    this.container=name+"_contentContainer"
	    this.local_offset=17 //17 for spacing from top
	    this.world_offset=ypos+this.local_offset 
	    this.track_length=hgt-34 //34 because scroll arrows are 15px tall *2 + 2px spacing for each
	    this.start_scroll=this.local_offset 
	    //this if condition has been put for increasing the scroll amount for larger textboxes.
	    if(hgt > 200)
	    {
	        this.scroll_amount=1
	    }
	    else
	    {
	        this.scroll_amount=0.5 
	    }
	    this.scrollbar_content_spacing=0
	    this.scrollTween=null
	    this.padding=0
    	
	    this.scrubber_color="#FFB9CBF9"
	    this.trackbar_color="#FFF5F3EF"
	    this.arrow_color="#FF000000"
	    this.arrow_button_color="#FFB9CBF9"
    	
	    this.mask_length=this.height
	    this.content_length=0

	    scrollPanelArr[this.name]=this
    		
	    this.createPanel=createPanel
	    this.createScroller=createScroller
    	
	    this.createPanel(parentCanvas, formatType)
	    this.createScroller(parentCanvas)
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Creates a panel for placing text
//Param1: canvas where object is to be placed after creation
//Param2: format type for the text
function createPanel(parentCanvas, formatType) 
{
    try
    {
	    var xaml_str='<Canvas Name="'+this.name+'_contentHolder" Canvas.Top="'+this.ypos+'" Canvas.Left="'+this.xpos+'" MouseEnter="scrollPanelOver" MouseLeave="scrollPanelOut"> '
	    xaml_str+=' <Rectangle Opacity="0" Fill="'+this.bg_color+'" Height="'+this.height+'" Width="'+this.width+'"></Rectangle>'
	    xaml_str+=' <Canvas.Clip>'
	    xaml_str+='   <RectangleGeometry Name="'+this.name+'_contentHolderClip" Rect="0,0,'+this.width+','+this.height+'" />'
	    xaml_str+=' </Canvas.Clip>'
	    xaml_str+=' <Canvas Name="'+this.name+'_contentContainer" Canvas.Top="0" Canvas.Left="0" > '
	    xaml_str+='  <TextBlock Text="" Canvas.Left="'+this.padding+'" Name="'+this.name+'_contentContainerText" TextWrapping="Wrap" Foreground="'+this.text_color+'" FontSize="'+this.text_size+'" FontFamily="'+this.text_font+'" Width="'+(this.width-(this.padding*2))+'"></TextBlock>'
	    xaml_str+=''
	    xaml_str+=' </Canvas>'
	    xaml_str+='</Canvas>'

	    xamlTags=plugin.content.createFromXaml(xaml_str)
	    parentCanvas.children.add(xamlTags)		
    	
	    switch(formatType)
	    {
	        case "simpleText":
	            parentCanvas.findName(this.name+"_contentContainerText").Text = this.fill_text;
	            break;
	        case "richText":
	            parseAndFormatText(this.fill_text, plugin, parentCanvas.findName(this.name+"_contentContainerText"));
	            break;
	        case "arrayText":
	             textbox = parentCanvas.findName(this.name+"_contentContainerText");
	             var textArray = this.fill_text.split("~#$");
	            for(var arrayIndex = 0 ; arrayIndex < textArray.length; arrayIndex++)
	            {
                    textbox.Text +=bulletCharacter +'   '+ textArray[arrayIndex]+'\n';
                }
	            //formatBulletedText(this.fill_text, parentCanvas.findName(this.name+"_contentContainerText"));
	            break;
	        default:
	            break;
	    }

	    this.content_length=Math.ceil(parentCanvas.findName(this.name+"_contentContainerText").actualHeight)
	}
	catch(err)
	{
	    //TO DO: Throw error message.
	}
}

//Creates a panel for placing the scrollbar
//Param1: canvas where object is to be placed after creation
function createScroller(parentCanvas) 
{
    try
    {
	    var xaml_str='<Canvas Name="'+this.name+'_scrollerContainer" Canvas.Top="'+this.ypos+'" Canvas.Left="'+(this.xpos+this.width+this.scrollbar_content_spacing)+'" MouseLeave="mainCanvasMouseLeave" MouseEnter="scrollPanelOver">'
		    xaml_str+=' <Canvas Name="'+this.name+'_Up" MouseLeftButtonDown="scrollerArrowPress" MouseLeftButtonUp="scrollerArrowRelease" MouseEnter="scrollButtonMouseEnter" MouseLeave="upDownScrollerMouseLeave"> '
		    xaml_str+='   <Rectangle Fill="'+this.arrow_button_color+'" Width="15" Height="15" StrokeThickness="0.8" RadiusX="1.831" RadiusY="1.831" RenderTransformOrigin="0.5,0.5">'
		    xaml_str+='<Rectangle.Stroke>';
            xaml_str+='<LinearGradientBrush EndPoint="0.228,0.92" StartPoint="0.772,0.08">';
            xaml_str+='<GradientStop Color="#FF4F7B92" Offset="0"/>';
            xaml_str+='<GradientStop Color="#FF4F7B92" Offset="1"/>';
            xaml_str+='</LinearGradientBrush>';
            xaml_str+='</Rectangle.Stroke>';
            xaml_str+='</Rectangle>'
		    xaml_str+='   <Path RenderTransformOrigin="0.5,0.5" Width="8.95" Height="5.338" Stretch="Fill" Stroke="#FF1F5174" StrokeThickness="1.5" Data="M318.7824,327.6828 L323.77446,331.62425 328.55205,327.58436" Canvas.Left="3" Canvas.Top="5" >'
		    xaml_str+='<Path.RenderTransform>'
		    xaml_str+='<TransformGroup>'
		    xaml_str+='<ScaleTransform ScaleX="1" ScaleY="1"/>'
		    xaml_str+='<SkewTransform AngleX="0" AngleY="0"/>'
		    xaml_str+='<RotateTransform Angle="180"/>'
		    xaml_str+='<TranslateTransform X="0" Y="0"/>'
		    xaml_str+='</TransformGroup>'
		    xaml_str+='</Path.RenderTransform>'
		    xaml_str+='</Path>'
		    xaml_str+=' </Canvas>'
		    xaml_str+=' <Canvas Name="'+this.name+'_Down" MouseLeftButtonDown="scrollerArrowPress" MouseLeftButtonUp="scrollerArrowRelease" MouseEnter="scrollButtonMouseEnter" MouseLeave="upDownScrollerMouseLeave" Canvas.Top="'+(this.height-15)+'"> '
		    xaml_str+='  <Rectangle Fill="'+this.arrow_button_color+'" Width="15" Height="15" StrokeThickness="0.8" RadiusX="1.831" RadiusY="1.831" RenderTransformOrigin="0.5,0.5"> '
		    xaml_str+='<Rectangle.Stroke>';
            xaml_str+='<LinearGradientBrush EndPoint="0.228,0.92" StartPoint="0.772,0.08">';
            xaml_str+='<GradientStop Color="#FF4F7B92" Offset="0"/>';
            xaml_str+='<GradientStop Color="#FF4F7B92" Offset="1"/>';
            xaml_str+='</LinearGradientBrush>';
            xaml_str+='</Rectangle.Stroke>';
            xaml_str+='</Rectangle>'
		    xaml_str+='  <Path RenderTransformOrigin="0.5,0.5" Width="8.95" Height="5.338" Stretch="Fill" Stroke="#FF1F5174" StrokeThickness="1.5" Data="M319.69891,327.1235 L323.77446,331.62425 327.85045,327.09854" Canvas.Left="3" Canvas.Top="5" />'
		    xaml_str+=' </Canvas>'
		    xaml_str+=' <Rectangle Name="'+this.name+'_TrackBarVisual" Fill="'+this.trackbar_color+'" Stroke="#FFF0F6FE" Height="'+(this.height-32)+'" Width="15" Canvas.Top="16"/> '
		    xaml_str+=' <Rectangle Name="'+this.name+'_TrackBar" MouseLeftButtonDown="pageScrollUpDownCapture" MouseLeftButtonUp="pageScrollUpDownRelease" Fill="transparent" Height="'+(this.height-33)+'" Width="15" Canvas.Top="17" /> '
		    xaml_str+=' <Rectangle Name="'+this.name+'_Scrubber" MouseLeftButtonDown="startDrag" MouseMove="continueDrag" MouseLeftButtonUp="endDrag" Fill="'+this.scrubber_color+'" MouseEnter="scrollbar_mouse_enter" MouseLeave="scrollbar_mouse_leave" Height="50" Width="13" Canvas.Top="17" Canvas.Left="1" RadiusX="1.831" RadiusY="1.831" RenderTransformOrigin="0.5,0.5"/> '
		    xaml_str+='</Canvas>'
    		

	    xamlTags=plugin.content.createFromXaml(xaml_str)
	    parentCanvas.children.add(xamlTags)	
    	
	    var tfRef=parentCanvas.findName(this.name+"_contentContainerText")
    	
	    showHideScrollBar(tfRef,this)	
	}
	catch(err)
	{
	    //TO DO:Throw error message
	}
}

//Called when the mouse leaves boundaries of up/down scrolling rectangles
//Param1: sender object
//Param1: event object
function upDownScrollerMouseLeave(s,e)
{
    try
    {
        scrollerArrowRelease(s,e)  
        s.children.getItem(0).SetValue("Fill","#FFB9CBF9"); 
    }
    catch(err)
    {
        //TO DO:throw error message
    }
}

function updateText(who,new_text) 
{
    try
    {
	    var tbRef=main.findName(who+"_contentContainerText")
	    var obj=scrollPanelArr[who]
    	
	    tbRef.text=new_text
    	
	    if(obj.scrollTween) 
	    {
		    obj.scrollTween.stop()
	    }
    	
	    showHideScrollBar(tbRef,obj)
	}
	catch(err)
	{
	    //TO DO:thorw error message
	}
}

//Decides whether to display the scrollbar or not
//Param1: textblock object
//Param2: the entire textarea control
function showHideScrollBar(tf,sp) 
{
    try
    {
	    var scroller_name=sp.name
	    var scrubberRef=main.findName(scroller_name+"_Scrubber")

	    //hide scroll bar if content isnt big enough to scroll
	    if(tf.actualHeight<=sp.mask_length) 
	    {
		    main.findName(scroller_name+"_scrollerContainer").visibility="Collapsed"
	    }
	    else 
	    {

		    main.findName(scroller_name+"_scrollerContainer").visibility="Visible"
		    sp.content_length=Math.ceil(tf.actualHeight)
    		
		    scrubberRef.height= Math.ceil( (sp.mask_length/sp.content_length) * sp.track_length)
            if(scrubberRef.height<3) 
            {
			    scrubberRef.height=3
		    }
	    }

	    //reset scrubber bar and canvas to inital spots	
	    scrubberRef["Canvas.Top"]=sp.local_offset
	    tf.findName(sp.container)["Canvas.Top"]=0
    }
    catch(err)
    {
        //TO DO:throw error message
    }
    
}

//Called when the mouse enters the textarea control boundary
//Param1: sender object
//Param2: event object
function scrollPanelOver(s,e) 
{
    try
    {
	    var sp_name=s.name.split("_")[0]
	    curScrollPanel=sp_name
	    window.onmousewheel = document.onmousewheel = mouseWheelChange
    }
    catch(err)
    {
        //TO DO:throw error message
    }
}

//Called when the mouse leaves the textarea control boundary
//Param1: sender object
//Param2: event object
function scrollPanelOut(s,e) 
{
    try
    {
	    this.mouse_down=0
	    clearInterval(mouseCheckInt)
	    s.releaseMouseCapture()
	    curScrollPanel=null
	    window.onmousewheel = document.onmousewheel = null;
	}
	catch(err)
	{
	    //TO DO:throw error message
	}
}

//Function called on scroll of the mouse centre button
//Param1: event object
function mouseWheelChange(event) 
{
    try
    {
        var delta = 0;
        if (!event) 
        { // For IE.
            event = window.event;
        }

        if (event.wheelDelta) 
        { //IE/Opera.
            delta = event.wheelDelta
            // In Opera 9, delta differs in sign as compared to IE.
            if (window.opera) 
            {
                delta = -delta;
            }
        }
        else if (event.detail) 
        { // Mozilla case.
            // In Mozilla, sign of delta is different than in IE.
            delta = -event.detail
            
        }
    	
	    if(curScrollPanel) 
	    {

		    var s=main.findName(curScrollPanel+"_TrackBar")
		    var e=null	
    	
		    var control=s.name.split("_")[0]
            if(s.findName(control+"_scrollerContainer").visibility == "Visible")
            {
		        mouseScrollUpDown(s,e,delta)
		    }
	    }
    	
        event.returnValue = false;
    }
    catch(err)
    {
        //TO DO:throw error message
    }
}

//Called when the mouse leaves the boundaries of the main canvas
//Param1 : sender
function mainCanvasMouseLeave(s) 
{
    try
    {
	    this.mouse_down=0
	    clearInterval(mouseCheckInt)
	    s.releaseMouseCapture()
	    curScrollPanel=null
	    window.onmousewheel = document.onmousewheel = null;
	}
	catch(err)
	{
	    //TO DO:throw error message
	}
}

function btnDown(s) 
{
    try
    {
	    var index=s.name.split("_")[2]
	    var which_scrollpanel=s.name.split("_")[1]
	    updateText("sp"+which_scrollpanel,textArr[index])		
	}
	catch(err)
	{
	    //TO DO:throw error message
	}
}

//Function to add text to the textblock in bulleted form
//Param1: text to be displayed
//Param2: textblock object
//Function to add text to the textblock in bulleted form
function formatBulletedText(text, textBox)
{
    try
    {
        var delimiter="~!@#~";
        var finalData = "";
        if(text!="")
        {
            var array = text.split(delimiter);
            var textBoxHeight;
            for(var count=0;count<array.length;count++)
            {
                finalData += " " + bulletCharacter + " ";
                textBox.Text = finalData;
                textBoxHeight = textBox.ActualHeight;
                var lineTextArray = array[count].split("");
                for(var charCount=0;charCount<lineTextArray.length;charCount++)
                {
                    textBox.Text = finalData + lineTextArray[charCount];
                    if(textBox.ActualHeight > textBoxHeight)
                    {
                        finalData += "\n" + "    " + lineTextArray[charCount];
                        textBox.Text = finalData;
                        textBoxHeight = textBox.ActualHeight;
                    }
                    else
                    {
                        finalData += lineTextArray[charCount];
                    }
                }
                finalData += "\n";
            }
        }
        textBox.Text = finalData;
    }
    catch(err)
    {
        //TO DO:throw error message
    }
}
//Changes the rectangle's color when mouse enters the up/down rectangle
//Param1: sender object
function scrollButtonMouseEnter(sender)
{
    try
    {
       // sender.children.getItem(0).SetValue("Fill","#FFDFF2FE");  
    }
    catch(err)
    {
        //TO DO:throw error message
    }
}
//Changes the scrollbar's color when mouse enters the scrollbar
//Param1: sender object
function scrollbar_mouse_enter(sender)
{
    try
    {
        if( this.mouse_down==1)
        {
            sender.SetValue("Fill","#FFA1B4DF");
        }
    }
    catch(err)
    {
    //TO DO:throw error message
    }
}

//Changes the scrollbar's color when mouse leaves the scrollbar
//Param1: sender object
function scrollbar_mouse_leave(sender)
{
    try
    {
        sender.setValue("Fill","#FFB9CBF9");
    }
    catch(err)
    {
        //TO DO:throw error message
    }
}

function Delegate() {}
Delegate.create = function (o, f) 
{
	var a = new Array() ;
	var l = arguments.length ;
	for(var i = 2 ; i < l ; i++) a[i - 2] = arguments[i] ;
	return function() 
	{
		var aP = [].concat(arguments, a) ;
		f.apply(o, aP);
	}
}

Tween = function(obj, prop, func, begin, finish, duration, suffixe)
{
	this.init(obj, prop, func, begin, finish, duration, suffixe)
}
var t = Tween.prototype;

t.obj = new Object();
t.prop='';
t.func = function (t, b, c, d) 
{ 
    return c*t/d + b; 
};
t.begin = 0;
t.change = 0;
t.prevTime = 0;
t.prevPos = 0;
t.looping = false;
t._duration = 0;
t._time = 0;
t._pos = 0;
t._position = 0;
t._startTime = 0;
t._finish = 0;
t.name = '';
t.suffixe = '';
t._listeners = new Array();	
t.setTime = function(t)
{
	this.prevTime = this._time;
	if (t > this.getDuration()) 
	{
		if (this.looping) 
		{
			this.rewind (t - this._duration);
			this.update();
			this.broadcastMessage('onMotionLooped',{target:this,type:'onMotionLooped'});
		} else 
		{
			this._time = this._duration;
			this.update();
			this.stop();
			this.broadcastMessage('onMotionFinished',{target:this,type:'onMotionFinished'});
		}
	} 
	else if (t < 0) 
	{
		this.rewind();
		this.update();
	} 
	else 
	{
		this._time = t;
		this.update();
	}
}
t.getTime = function()
{
	return this._time;
}
t.setDuration = function(d)
{
	this._duration = (d == null || d <= 0) ? 100000 : d;
}
t.getDuration = function()
{
	return this._duration;
}
t.setPosition = function(p)
{
	this.prevPos = this._pos;
	var a = this.suffixe != '' ? this.suffixe : '';
	this.obj[this.prop] = Math.round(p) + a;
	this._pos = p;
	this.broadcastMessage('onMotionChanged',{target:this,type:'onMotionChanged'});
}
t.getPosition = function(t)
{
	if (t == undefined) t = this._time;
	return this.func(t, this.begin, this.change, this._duration);
};
t.setFinish = function(f)
{
	this.change = f - this.begin;
};
t.geFinish = function()
{
	return this.begin + this.change;
};
t.init = function(obj, prop, func, begin, finish, duration, suffixe)
{
	if (!arguments.length) return;
	this._listeners = new Array();
	this.addListener(this);
	if(suffixe) this.suffixe = suffixe;
	this.obj = obj;
	this.prop = prop;
	this.begin = begin;
	this._pos = begin;
	this.setDuration(duration);
	if (func!=null && func!='') 
	{
		this.func = func;
	}
	this.setFinish(finish);
}
t.start = function()
{
	this.rewind();
	this.startEnterFrame();
	this.broadcastMessage('onMotionStarted',{target:this,type:'onMotionStarted'});
}
t.rewind = function(t)
{
	this.stop();
	this._time = (t == undefined) ? 0 : t;
	this.fixTime();
	this.update();
}
t.fforward = function()
{
	this._time = this._duration;
	this.fixTime();
	this.update();
}
t.update = function()
{
	this.setPosition(this.getPosition(this._time));
}
t.startEnterFrame = function()
{
	this.stopEnterFrame();
	this.isPlaying = true;
	this.onEnterFrame();
}
t.onEnterFrame = function()
{
	if(this.isPlaying) 
	{
		this.nextFrame();
		setTimeout(Delegate.create(this, this.onEnterFrame), 0);
	}
}
t.nextFrame = function(){
	this.setTime((this.getTimer() - this._startTime) / 1000);
	}
t.stop = function()
{
	this.stopEnterFrame();
	this.broadcastMessage('onMotionStopped',{target:this,type:'onMotionStopped'});
}
t.stopEnterFrame = function()
{
	this.isPlaying = false;
}

t.continueTo = function(finish, duration)
{
	this.begin = this._pos;
	this.setFinish(finish);
	if (this._duration != undefined)
		this.setDuration(duration);
	this.start();
}
t.resume = function()
{
	this.fixTime();
	this.startEnterFrame();
	this.broadcastMessage('onMotionResumed',{target:this,type:'onMotionResumed'});
}
t.yoyo = function ()
{
	this.continueTo(this.begin,this._time);
}

t.addListener = function(o)
{
	this.removeListener (o);
	return this._listeners.push(o);
}
t.removeListener = function(o)
{
	var a = this._listeners;	
	var i = a.length;
	while (i--) 
	{
		if (a[i] == o) 
		{
			a.splice (i, 1);
			return true;
		}
	}
	return false;
}
t.broadcastMessage = function()
{
	var arr = new Array();
	for(var i = 0; i < arguments.length; i++)
	{
		arr.push(arguments[i])
	}
	var e = arr.shift();
	var a = this._listeners;
	var l = a.length;
	for (var i=0; i<l; i++)
	{
		if(a[i][e])
		a[i][e].apply(a[i], arr);
	}
}
t.fixTime = function()
{
	this._startTime = this.getTimer() - this._time * 1000;
}
t.getTimer = function()
{
	return new Date().getTime() - this._time;
}
Tween.backEaseIn = function(t,b,c,d,a,p)
{
	if (s == undefined) var s = 1.70158;
	return c*(t/=d)*t*((s+1)*t - s) + b;
}
Tween.backEaseOut = function(t,b,c,d,a,p)
{
	if (s == undefined) var s = 1.70158;
	return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
}
Tween.backEaseInOut = function(t,b,c,d,a,p)
{
	if (s == undefined) var s = 1.70158; 
	if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
	return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
}
Tween.elasticEaseIn = function(t,b,c,d,a,p)
{
		if (t==0) return b;  
		if ((t/=d)==1) return b+c;  
		if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) 
		{
			a=c; var s=p/4;
		}
		else 
			var s = p/(2*Math.PI) * Math.asin (c/a);
		
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	
}
Tween.elasticEaseOut = function (t,b,c,d,a,p)
{
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (!a || a < Math.abs(c)) { a=c; var s=p/4; 
		}
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
}
Tween.elasticEaseInOut = function (t,b,c,d,a,p)
{
	if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) var p=d*(.3*1.5);
	if (!a || a < Math.abs(c)) {var a=c; var s=p/4; }
	else var s = p/(2*Math.PI) * Math.asin (c/a);
	if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
}

Tween.bounceEaseOut = function(t,b,c,d)
{
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
}
Tween.bounceEaseIn = function(t,b,c,d)
{
	return c - Tween.bounceEaseOut (d-t, 0, c, d) + b;
}
Tween.bounceEaseInOut = function(t,b,c,d)
{
	if (t < d/2) return Tween.bounceEaseIn (t*2, 0, c, d) * .5 + b;
	else return Tween.bounceEaseOut (t*2-d, 0, c, d) * .5 + c*.5 + b;
}

Tween.strongEaseInOut = function(t,b,c,d)
{
	return c*(t/=d)*t*t*t*t + b;
}

Tween.regularEaseIn = function(t,b,c,d)
{
	return c*(t/=d)*t + b;
}
Tween.regularEaseOut = function(t,b,c,d)
{
	return -c *(t/=d)*(t-2) + b;
}

Tween.regularEaseInOut = function(t,b,c,d)
{
	if ((t/=d/2) < 1) return c/2*t*t + b;
	return -c/2 * ((--t)*(t-2) - 1) + b;
}
Tween.strongEaseIn = function(t,b,c,d)
{
	return c*(t/=d)*t*t*t*t + b;
}
Tween.strongEaseOut = function(t,b,c,d)
{
	return c*((t=t/d-1)*t*t*t*t + 1) + b;
}

Tween.strongEaseInOut = function(t,b,c,d)
{
	if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
	return c/2*((t-=2)*t*t*t*t + 2) + b;
}

//Called for implementing the mouse scroll
//Param1:sender object
//Param2:event object
//Param3:diff value used to calculate scrolling distance
function mouseScrollUpDown(s,e,diff)
{
    try
    {
      key=s.name.split("_")[0]

	    var obj=scrollPanelArr[key]
	    var time_to_scroll
	    var click_x
	    var click_y
	    var click_prop
	    var scrubber_prop
	    var new_val
    	
	    var	scrubber=s.findName(key+"_Scrubber")
    	
	    if(e) { // if event came from trackbar press
		    click_x=e.getPosition(s).x
		    click_y=e.getPosition(s).y
    	
		    //on track bar press - time for scroll bar animation
		    time_to_scroll = 0.01
	    }
	    else { //else event came from mouse wheel
    	
		     //on mouse wheel scroll - time for scroll bar animation
		    //increasing this time_to_scroll value will introduce the empty space on scrolling up/down
		    time_to_scroll = 0.0001
    		
		    var scroll_amount=1
    		
    		
		    if(diff>0) {
			    click_y=(scrubber["Canvas.Top"]-obj.local_offset)-scroll_amount
		    }
		    else {	
			    click_y=(scrubber["Canvas.Top"]-obj.local_offset+scrubber.height)+scroll_amount
		    }
    		
		    if(click_y<0) {
			    click_y=0
		    }
		    else if(click_y>obj.track_length) {
			    click_y=obj.track_length
		    }
	    }
    	
    	
	    if(obj.direction=="H") {
		    click_prop=click_x
		    canvas_prop="Canvas.Left"
		    scrubber_prop=scrubber.width
	    }
	    else {
		    click_prop=click_y
		    canvas_prop="Canvas.Top"
		    scrubber_prop=scrubber.height
	    }
    	
	    //handles muliptle trackbar clicks
	    if(obj.scrollTween) {
		    obj.scrollTween.stop()
	    }
	    //for scroll up
	    if(click_prop < scrubber[canvas_prop] - obj.local_offset) {
	        var diff = scrubber[canvas_prop] - click_prop;
	        var mouseScrollAmountUp = 0;
	        var	textareaControl=s.findName(key+"_contentHolder").children.getItem(0);
    	    
	        if(diff > 10) //changed from 20 to 10 to adjust mouse scrolling speed in both directions
	        {
	            if((scrubber[canvas_prop] - 5) < obj.local_offset)
	            {
    	            
                   if(textareaControl["Height"] < 50)
                   {
                        mouseScrollAmountUp = 0.5;
                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(scrubber[canvas_prop] - mouseScrollAmountUp),time_to_scroll)
                   }
	               else
	               {
	                    mouseScrollAmountUp = ((obj.track_length+obj.local_offset) - scrubber["Height"])/10
	                    if(scrubber[canvas_prop] - mouseScrollAmountUp < obj.local_offset)
	                    {
	                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(obj.local_offset),time_to_scroll)
	                    }
	                    else
	                    {
	                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(scrubber[canvas_prop] - mouseScrollAmountUp),time_to_scroll)
	                    }
	               }
	            }
	            else
	            {
	                if(textareaControl["Height"] < 50)
                   {
                        click_prop = 0.5;
                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(scrubber[canvas_prop] - click_prop),time_to_scroll)
                   }
                   else 
                   {
	                    click_prop = scrubber[canvas_prop] - obj.local_offset - 5;
	                    obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(click_prop+obj.local_offset),time_to_scroll)
	               }
                   if(click_prop+obj.local_offset < obj.local_offset)
                    {
                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(obj.local_offset),time_to_scroll)
                    }
	            }
                
	        }
    		
	    }
	    //for scroll down
	    else {
	        if(Math.ceil(scrubber[canvas_prop] + scrubber_prop) <= (obj.track_length+obj.local_offset))
	        {
	            var diff = click_prop + s[canvas_prop]- scrubber[canvas_prop] + scrubber_prop;
	            var mouseScrollAmountDown = 0;
	            if(diff >= 0)
	            {
	                if(diff >= 3)
	                {
	                   if(click_prop + s[canvas_prop] > (scrubber[canvas_prop] + scrubber_prop))
	                   {
        	                
	                        if(scrubber[canvas_prop] + scrubber_prop + 9 <= (obj.track_length+obj.local_offset))
	                        {
	                            mouseScrollAmountDown = 5;
	                        }
	                        else
	                        {
	                           var	textareaControl=s.findName(key+"_contentHolder").children.getItem(0);
	                           if(textareaControl["Height"] < 50)
	                           {
	                                mouseScrollAmountDown = 0.5;
	                           }
	                           else
	                           { 
	                                mouseScrollAmountDown = (obj.track_length + obj.local_offset) - (scrubber[canvas_prop]+ scrubber["Height"]) ;
	                           }
	                        }
	                        obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],scrubber[canvas_prop] + mouseScrollAmountDown,time_to_scroll)
	                   }
	                }
	                else  
	                {
	                    obj.scrollTween = new Tween(new Object(),'st',Tween.strongEaseOut,scrubber[canvas_prop],(click_prop-scrubber_prop+obj.local_offset),time_to_scroll)
	                }
	            }
	        }
	    }
    	
	    if(obj.scrollTween != null) 
	    {
	        obj.scrollTween.onMotionChanged = function(event){
		    scrubber[canvas_prop] = event.target._pos
    		
		    new_val=event.target._pos

		    if(obj.direction=="H") {
			    val=((new_val-obj.start_scroll)/(obj.track_length-scrubber.width))*100
			    canvas_prop="Canvas.Left"
		    }
		    else {
			    val=((new_val-obj.start_scroll)/(obj.track_length-scrubber.height))*100
			    canvas_prop="Canvas.Top"
		    }
		    var per=val/100
		    var resetValue = ((obj.content_length - obj.mask_length)*per)*-1	
		    //if()
		    s.findName(obj.container)[canvas_prop]=((obj.content_length - obj.mask_length)*per)*-1	
    		
	    }

	    obj.scrollTween.start()
	    }
	    //To reset the text if it goes above the canvas
	    if(s.findName(obj.container)[canvas_prop] > 0)
        {
            s.findName(obj.container)[canvas_prop] = 0
        }
        //To reset scrollbar if it moves above trackbar top
        if(scrubber[canvas_prop] < obj.local_offset)
        {
            scrubber[canvas_prop] = obj.local_offset
        }
        //To reset scrollbar if it moves below trackbar bottom
        if(scrubber[canvas_prop] + scrubber["Height"] - obj.local_offset > obj.track_length)
        {
            scrubber[canvas_prop] = (obj.track_length  - scrubber["Height"])
        }
    obj.scrollTween = null;
    }
    catch(err)
    {
        //TO DO:throw error message
    }
}

// SIG // Begin signature block
// SIG // MIIbDAYJKoZIhvcNAQcCoIIa/TCCGvkCAQExCzAJBgUr
// SIG // DgMCGgUAMGcGCisGAQQBgjcCAQSgWTBXMDIGCisGAQQB
// SIG // gjcCAR4wJAIBAQQQEODJBs441BGiowAQS9NQkAIBAAIB
// SIG // AAIBAAIBAAIBADAhMAkGBSsOAwIaBQAEFEP1lEzYk76w
// SIG // rrCIc3ACe9R4P9oToIIV5zCCBIUwggNtoAMCAQICCmEF
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
// SIG // KMJFRYAdkCK9jqIFPjyzT73XOeCIkzCCBMowggOyoAMC
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
// SIG // dCBDb2RlIFNpZ25pbmcgUENBAgphBfceAAAAAAAyMAkG
// SIG // BSsOAwIaBQCggb4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwIwYJKoZIhvcNAQkEMRYEFJ9nL1AegVb1ki1GpYRH
// SIG // saBRH9QoMF4GCisGAQQBgjcCAQwxUDBOoCaAJABNAGkA
// SIG // YwByAG8AcwBvAGYAdAAgAEwAZQBhAHIAbgBpAG4AZ6Ek
// SIG // gCJodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vbGVhcm5p
// SIG // bmcgMA0GCSqGSIb3DQEBAQUABIIBAJ3ZancWOW53gEQp
// SIG // vHJy8vxHob81T+dLxJgwQlRWofi4KzoAuBMZ6I3wSF+7
// SIG // aVRHGuepezXaWr7iqNVWvLoLjlN10hsi2VWMoK2hlsHN
// SIG // H6XmP6syYBw6bwq54yjt5+dbww66VKH7OU8ZJ4kLOSDR
// SIG // zx93knjaa+9UEi2m8YMjtKXhyUZi2yjJqFbmU+uao1Qt
// SIG // OUjtjx6orv9vU2FtOvwfgtv0yuD2/BNibI/9yqrPcEAb
// SIG // i6mUemw4a9agsWtDjag9lu5b3Fqt2JnToXd8XMyADYwS
// SIG // CTh45XnTojKAzm/p3k1JFGUw88/g6B8HEV+cjNA2UgkS
// SIG // /KijUPtQozDbbAhaL3mhggIdMIICGQYJKoZIhvcNAQkG
// SIG // MYICCjCCAgYCAQEwgYUwdzELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEhMB8GA1UEAxMYTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // UENBAgphA9z2AAAAAAAMMAcGBSsOAwIaoF0wGAYJKoZI
// SIG // hvcNAQkDMQsGCSqGSIb3DQEHATAcBgkqhkiG9w0BCQUx
// SIG // DxcNMTAwMjE5MjIzNzIwWjAjBgkqhkiG9w0BCQQxFgQU
// SIG // 1QzAE8ucNbE4TkBKoFg1VGCYrygwDQYJKoZIhvcNAQEF
// SIG // BQAEggEAvcBDGnZtqR/eczL+d4q9yXEonKL+SVUiRJqp
// SIG // DLeHabSpXkWTOkBbdJEivnDr7Kd9O1An0TvfybakSyxL
// SIG // 32kPlcjsmyjHRaUB2Kw74pWIrtwCapYC1IFLwtwsMBp5
// SIG // Ui4XQkL1TezFOUKxP/mdyvM3p3IxsRV9Li9kI1R4Nwtv
// SIG // ULXyg4GIxp+mDMF504tOBR9JH3lN92yxgsEq3U+CoX2E
// SIG // HTbdi5Uz4uMFhRtpDW9QD30RdhBzgrBfRIDYmc85ro8r
// SIG // vdYoqsMTNUd3OErBCr+GOHX/ljF139B33gLN+y5LU1OU
// SIG // +KfODjsk6PawgJ23sbVFbqSuOSXkj1HJ9fF7aFjb+Q==
// SIG // End signature block
