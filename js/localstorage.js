(function() {

	var ls = window.localStorage;
	var scriptList = ['/js/lib/jqmobi.js'];//js文件列表
	var styleList = []; //css文件列表
	var scriptVersion = '0.1.1'; //js文件版本号
	var styleVersion = '0.1.1'; //css文件版本号
	var scriptIndex = 0;//标记script的index
	var styleIndex = 0;//标记style的index

	var cache = {
		script: '', //存储临时脚本缓存
		style: ''  //存储临时样式文件缓存
	};

	var helper = {
		/**
		 * [ajaxGet description]
		 * @param  {[type]}   url      [description]
		 * @param  {Function} callback [description]
		 * @return {[type]}            [description]
		 */
		ajaxGet: function(url, callback) {
			var request = new XMLHttpRequest();
		    if (!request) { 
		    	return;
		    }
		    request.open("GET", url, true);
		    request.onreadystatechange = function () {
		    	if (request.readyState == 4) {
		    		callback(request.responseText);
		      	}
		    };
		    request.send(null);
		},
		/**
		 * [getFile 循环加载js跟css文件,调用两次]
		 * @param  {[number]} index   [资源列表里的文件的index]
		 * @param  {[array]} list    [需要加载的资源列表]
		 * @param  {[string]} version [js或者css文件服务器端的版本号]
		 * @param  {[string]} type    [标示是'script'还是'style']
		 * @param  {[type]} callback    [回调函数]
		 * @return {[type]}         [description]
		 */
		getFile: function(index, list, version, type, callback) {
			if (list.length == 0) { return };
			var cacheTmp = cache.script;
			if (type == 'style') {
				cacheTmp = cache.style;
			};
			helper.ajaxGet(list[index] + '?v=' + version, function(data) {
				cacheTmp += data;
				if (++index < list.length) {
					helper.getFile(index, list, version, type);
				} else {				
					if (type == 'script') {
						//存入缓存
						localStorage['script_cache'] = cacheTmp;
						//存入当前版本号
						localStorage['script_cache_version'] = version || 0;
					} else if (type == 'style') {
						//存入缓存
						localStorage['style_cache'] = cache.style;
						//存入当前版本号
						localStorage['style_cache_version'] = version || 0;
					};
					setTimeout(function(){
						//执行脚本
						eval(cacheTmp);
						cacheTmp = '';					
					},100);
	            }
	            callback && callback.call(this);
			});
		},
		/**
		 * [docWrite 输出脚本以及样式文件]
		 * @return {[type]} [description]
		 */
		docWrite: function() {
			for(var i = 0;i < scriptList.length ; i++ ){
				document.write('<script src="'+scriptList[i]+'"><\/script>');
			};
			for(var i = 0;i < styleList.length ; i++ ){
				document.write('<link rel="stylesheet" type="text/css" href="' + styleList[i] + '" media="all">');
			};
		}
	};

	//载入脚本
	//如果支持localstorage
	if ( ls && ls.getItem ) {
		//关于样式文件
		//服务器保存的样式文件版本，通过页面直接输出变量
		var serverStyleVersion = styleVersion || 0;
		//本地样式版本号
		var localStyleVersion = localStorage['style_cache_version'] || -1;
		//如果版本号不一致，或者不存在缓存，重新载入脚本
		if(serverStyleVersion != localStyleVersion || !localStorage['style_cache']){
			helper.getFile(styleIndex, styleList, styleVersion, 'style');
		}else{
		    //执行脚本
			setTimeout(function(){
				eval(localStorage['style_cache']);
			},100);
		}

		//关于脚本文件
		//服务器保存的脚本版本，通过页面直接输出变量
		var serverScriptVersion = scriptVersion || 0;
		//本地脚本版本号
		var localScriptVersion = localStorage['script_cache_version'] || -1;
		//如果版本号不一致，或者不存在缓存，重新载入脚本
		if(serverScriptVersion != localScriptVersion || !localStorage['script_cache']){
			helper.getFile(scriptIndex, scriptList, scriptVersion, 'script');
		}else{
		    //执行脚本
			setTimeout(function(){
				eval(localStorage['script_cache']);
			},100);
		}
	} else {
		helper.docWrite();
	};

})();