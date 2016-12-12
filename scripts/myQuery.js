// Custom jQuery esque element accessor / injector
function $(id){
	var e = id;
	if(typeof id == 'string'){
		e = document.getElementById(id);
	}
	if(e.__injectified != undefined){
		return e;
	} else {
		e.__injectified = true;
	}
	e.forEachChild = (callback) => {
		for(var i = 0; i < e.children.length;i++){
			callback(e.children[i]);
		}
	};
	e.contentWidth = () => {
		var width = e.clientWidth;
		var pleft = parseInt(window.getComputedStyle(e, null).getPropertyValue('padding-left'));
		var pright = parseInt(window.getComputedStyle(e, null).getPropertyValue('padding-right'));
		width -= pleft + pright;
		return width;
	};
	e.contentHeight = () => {
		var width = e.clientHeight;
		var ptop = parseInt(window.getComputedStyle(e, null).getPropertyValue('padding-top'));
		var pbottom = parseInt(window.getComputedStyle(e, null).getPropertyValue('padding-bottom'));
		width -= ptop + pbottom;
		return width;
	};
	return e;
}

var Tools = {};

Tools.shuffle = (array) => {
	var index = array.length;
	while(index > 0){
		var i = Math.floor(Math.random() * index--);
		var t = array[index];
		array[index] = array[i];
		array[i] = t;
	}
};
