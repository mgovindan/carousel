//------------------------------------------------------------------------------
// JavaScript Curve / Circle / Arch Carousel v1.0.0 Project - http://jshibernate.com/
// Copyright (C) 2013 JsHibernate (http://jshibernate.com). all rights reserved.
// This project is licensed under the Microsoft Reciprocal License (Ms-RL)
// This license can be found here: http://jshibernate.com/
// Mail To: murugasen.g@gmail.com
//-------------------------------------------------------------------------------

function Carousel() {
    this.init = function (options) {
        this.options = options || {};
        this.options.height = this.options.height || 200;
        this.options.width = this.options.width || 650;

        this.horizontalRadious = this.options.width / 2;
        this.verticalRadious = this.options.height / 2;

        this.minLimit = this.horizontalRadious - ((this.options.width / 3) / 2); //carousel.options.width / 3
        this.maxLimit = this.horizontalRadious + ((this.options.width / 3) / 2);

        this.speed = this.options.speed || 0;
        this.isRunning = false;
        this.direction = 0;
        this.accelerate = 0;
  	this.loop = this.options.loop || false;
		this.timer = null;
		this.stoptimer = null;

        var j = 7, bars = $("#" + this.options.id);
        for (var i = (Math.PI / 8); i < (Math.PI); (i = i + (Math.PI / 8))) {

            $(bars.children('div')[j - 1]).css(this.getStyle(i));
            $(bars.children('div')[j - 1]).attr('data-index', j);

            j--;
        }
		
		bars.mousemove(function (e) {
            carousel.handleEvent(e, 'mouseover');
        });
		
        bars.mouseenter(function (e) {
            carousel.handleEvent(e, 'mouseover');
        });

        bars.mouseleave(function (e) {
            carousel.handleEvent(e, 'mouseout');
        });
    }

    this.getStyle = function (pi) {

        var left = ((Math.cos(pi) * this.horizontalRadious) + this.horizontalRadious);
        var top = ((Math.sin(pi) * this.verticalRadious) + this.verticalRadious);

        var opacity = top / this.options.height;
        if (opacity < 1)
            opacity -= 0.3;
        
        if (pi == (Math.PI / 8) || pi == (Math.PI - (Math.PI / 8)))
            opacity = 0.1;

        if (pi < (Math.PI / 8) || pi >= Math.PI)
            opacity = 0;
		
		//Add relative position
		left += $("#" + this.options.id).position().left;
		top += $("#" + this.options.id).position().top;
			
        return { left: left + 'px', top: top + 'px', opacity: opacity };
    }

    this.play = function () {

        if (this.options.maxCount <= 7)
            return;

        if (!this.isRunning && this.accelerate > 0 && this.direction != 0) {
            if (this.stoptimer)
                clearTimeout(this.stoptimer);
            this.timer = window.setTimeout('carousel.play();', this.accelerate);
            this.isRunning = true;
            this.stoptimer = 0;

            return;
        }
        else if (this.isRunning && this.accelerate == 0 && this.direction == 0) {
            this.stop();
            return;
        }
        else if (!this.isRunning && this.accelerate == 0 && this.direction == 0) {
            //console.log('oops! gone mad :(');
            return;
        }

        clearTimeout(this.timer);

        var barcontainer = $('#' + this.options.id);
        var firstChild = $(barcontainer.children('div')[0]);
        var lastChild = $(barcontainer.children('div')[6]);

        //To Do: load dynamic image / bar
        var index = parseInt(this.direction > 0 ? lastChild.attr('data-index') : firstChild.attr('data-index'));

        index = (index + this.direction);
        if (index <= 0)
        {   
			if(this.loop !== true)
			{
				this.stop();
				return;
			}
			index = this.options.maxCount; //maxcount
		}
        else if (index == this.options.maxCount + 1)
        {   
			if(this.loop !== true)
			{
				this.stop();
				return;
			}		
			index = 1; //maxcount
		}
		
		var newitem = null;
        if (typeof this.options.loader == 'function')
            newitem = this.options.loader(index, this.direction)

        if (!newitem)
            newitem = $('<div class="barcontainer"></div>'); //$('<div class="barcontainer"><ul class="bar"><li class="' + cls + ' "><div class="top"></div><div class="bottom" style="height:185px;"></div></li></ul></div>');

        newitem.attr('data-index', index);

        if (this.direction > 0) {

            newitem.css(this.getStyle(0));
            newitem.appendTo(barcontainer);

            var j = 0;
            for (var i = Math.PI; i >= (Math.PI / 8); i = i - (Math.PI / 8)) {
                $(barcontainer.children('div')[j]).animate(this.getStyle(i), this.accelerate);

                j++;
            }
            newitem.animate(this.getStyle(Math.PI / 8), this.accelerate, function () {

                
                for (var xx = 7; xx < $('#' + carousel.options.id).children('div').length; xx++)
                    $($('#' + carousel.options.id).children('div')[0]).remove();

                //$($('#' + carousel.options.id).children('div')[0]).remove();

                if (carousel.isRunning && !carousel.stoptimer && carousel.accelerate)
                    carousel.timer = window.setTimeout('carousel.play();', carousel.accelerate);
            });
        }
        else if (this.direction < 0) {

            newitem.css(this.getStyle(Math.PI));
            newitem.insertBefore(firstChild);

            var j = 7;
            for (var i = 0; i < (Math.PI); i = i + (Math.PI / 8)) {
                $(barcontainer.children('div')[j]).animate(this.getStyle(i), this.accelerate);

                j--;
            }

            newitem.animate(this.getStyle(Math.PI - (Math.PI / 8)), this.accelerate, function () {
               
                var children = $('#' + carousel.options.id).children('div');
                for (var xx = 7; xx < children.length; xx++)
                    $(children[xx]).remove();

                //$($('#' + carousel.options.id).children('div')[7]).remove();

                if (carousel.isRunning && !carousel.stoptimer && carousel.accelerate)
                    carousel.timer = window.setTimeout('carousel.play();', carousel.accelerate);
            });
        }
        else if (this.direction == 0 && this.timer) {
            clearTimeout(this.timer);
        }
    }

    this.stop = function () {
        if (this.timer)
            clearTimeout(this.timer);

        if (this.stoptimer)
            clearTimeout(this.stoptimer);

        this.isRunning = false;
        this.direction = 0;
        this.accelerate = 0;
        this.stoptimer = 0;
        this.timer = 0;
    }

    this.handleEvent = function (e, params) {

        if (params == 'mouseover') 
        {
            var pointer = (e.pageX - $("#" + this.options.id).position().left), direction = 0;

            if (pointer > this.maxLimit) {
                direction = 1;

                this.accelerate = 225; //(this.options.width - pointer) * 3;
            }
            else if (pointer < this.minLimit) {
                direction = -1;
                this.accelerate = 225; // (pointer - $('#' + this.options.id).position().left) * 3;
            }

            if (this.accelerate < 0)
                this.accelerate *= -1;

            this.direction = direction;
            if (this.direction == 0) {
                this.accelerate = 0;
                this.stop();
            }
            else if (!this.isRunning) {
                this.play();
            }
        }
        else if (params == 'mouseout') {
            if(!this.stoptimer)
                this.stoptimer = window.setTimeout('carousel.stop();', 150);
        }
    }
}
