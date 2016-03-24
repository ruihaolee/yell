(function(){
	var expressType;
	var tvId;
	var myThis;
	jQuery(function(){
		firPosLine();
		tvId = new GetType('http://api.jisuapi.com/tv/channel?appkey=9f7ee696768c85e6');
		expressType = new GetType('http://api.jisuapi.com/express/type?appkey=9f7ee696768c85e6');
		$('#tv').bind('click',tvId,tvId.getTypeOrId);
		$('#express').bind('click',expressType,expressType.getTypeOrId);
		//使用Bind的第二可选参数将真正要添加的对象作为额外数据传进去
		$('.find').bind('click',findClick);
		$("#header").bind('click',Blueline.posBlueLine);
	});
	jQuery.fx.speeds['lee'] = 300;
	function firPosLine(){
		var fir_Box = document.getElementsByClassName('inquireBox')[0];
		var fir_pos = $(fir_Box).position();//jQuery中获取以父级元素为标准的坐标
		var fir_height = $(fir_Box).outerHeight();//outer包含maring padding border
		$('#Blueline').css({
			left: fir_pos.left + 'px',
			top: (fir_pos.top + fir_height + 5) + 'px'
		});
		var thisBodyArr = document.getElementsByClassName('thisBody');
		$(thisBodyArr[0]).css({
			zIndex: '2',
			opacity: '1'
		});
	}
	var Blueline = {
		perShow: 'train',
		posBlueLine:function(event){
		var tempEle = event.target; //jQuery中事件处理程序的第一个参数就是事件对象
		while(tempEle){
			if(tempEle.getAttribute('id') === 'header')
				return;
			if(tempEle.getAttribute('class') == 'inquireBox')
				break;
			tempEle = tempEle.parentNode;
		}
		if($(tempEle).attr('id') === Blueline.perShow)
			return;
		showAndHide($(tempEle).attr('id'),Blueline.perShow);
		Blueline.perShow = $(tempEle).attr('id');
		$('#userData>*').remove();//*通配符
		Concurrent.Thread.create(function(left){
			$('#Blueline').animate({
					left: left
				},{
					duration: 'lee',
					easing: 'swing'
				});
		},tempEle.offsetLeft);
	  }
	}
	function showAndHide(show,hide){
		var showBody = document.getElementById(show + '_body');
		var hideBody = document.getElementById(hide + '_body');
		$(showBody).animate({
			opacity: 1,
			zIndex: 2
		},{
			duration: 'lee',
			easing: 'swing'
		});
		$(hideBody).animate({
			opacity: 0,
			zIndex: 1
		},{
			duration: 'lee',
			easing: 'swing'
		});
	}
	function GetType(thisUrl){
		this.url = thisUrl;
	}
	GetType.prototype = {
		getTypeOrId: function(){
			console.log(arguments[0].data);
			//console.log(this);
			myThis = arguments[0].data;
			jQuery.ajax({
				type: 'get',
				url: myThis.url,
				dataType: 'jsonP',
				success: myThis.successFun
			});
		},
		successFun: function(data){
			myThis.typeOrId = data.result;
			console.log(myThis);//如果AJAX的成功回调函数在类的prototype中,this指向的是 XMLHtppRequest对象
		},
		constructor: GetType
	};
	function findClick(){
		var thisBody = '#'+ Blueline.perShow + '_body';
		var textArr = $(thisBody).find(':input').map(function(){
			return $(this).val();
		}).toArray();
		var radioVal = $(thisBody).find(':radio[name=GT]:checked').val();//选择器值得复习
		$('#userData>*').remove();
		var myReg = /[^（）]+/;
		switch(Blueline.perShow){
			case 'train':
				Go(textArr,radioVal);
				break;
			case 'shouji':
				Go(textArr);
				break;
			case 'tv':
				var flag = 0;
				for(var oneTv in tvId.typeOrId){ //记住！for in 中的 oneTv 是个字符串！是属性名！

					//var a = myReg.exec(tvId.typeOrId[oneTv].name)[0];
					if(tvId.typeOrId[oneTv].name.match(myReg))
					{
						var a = tvId.typeOrId[oneTv].name.match(myReg)[0];
						console.log(a);
						if (a === textArr[0]) {
							alert("!!!");
							flag = 1;
							textArr[0] = tvId.typeOrId[oneTv].tvid;
						}
					}
				}
				if (flag === 0) {
					alert('没有查询到电视台！请输入正确的名称！');
				}
				Go(textArr);
				break;
			case 'idcard':
				Go(textArr);
				break;
			case 'express':
				var flag = 0;
				console.log(expressType.typeOrId);
				for(var oneExp in expressType.typeOrId){
					if (expressType.typeOrId[oneExp].name === textArr[0]){
						flag = 1;
						textArr[0] = expressType.typeOrId[oneExp].type;
					}
				}
				if(flag === 0){
					alert('请输入正确的快递公司!');
					return;
				}
				Go(textArr);
				break;
		}
	}
	function Go(textArr,radioVal){
		var data = {};
		var myUrl = null; 
		switch(Blueline.perShow){
			case 'train':
				data.start = textArr[0];
				data.end = textArr[1];
				data.ishigh = parseInt(radioVal);
				myUrl = 'http://api.jisuapi.com/train/station2s?appkey=9f7ee696768c85e6';
				break;
			case 'shouji':
				data.shouji = textArr[0];
				myUrl = 'http://api.jisuapi.com/shouji/query?appkey=9f7ee696768c85e6';
				break;
			case 'tv':
				data.tvid = textArr[0];
				data.date = textArr[1];
				myUrl = 'http://api.jisuapi.com/tv/query?appkey=9f7ee696768c85e6';
				break;
			case 'idcard':
				data.idcard = textArr[0];
				myUrl = 'http://api.jisuapi.com/idcard/query?appkey=9f7ee696768c85e6';
				break;
			case 'express':
				data.type = textArr[0];
				data.number = textArr[1];
				myUrl = 'http://api.jisuapi.com/express/query?appkey=9f7ee696768c85e6'
				break;
		}
		console.log(data);
		console.log(myUrl);
		jQuery.ajax({
			type: 'GET',
			dataType: 'jsonP',
			data: data, //data属性值 可以使对象也可以是字符串，如果是对象会以名值对的形式添加到请求url中
			url: myUrl,
			success: getUserData
		});
		function getUserData(data){
			var result = null;
			var sxName = null;
			switch(Blueline.perShow){
				case 'train':
					if(data.status === '203' || data.status === '202'|| data.status === '201'){
						alert('车次为空！请输入正确的城市！');
						return;
					}
					result = data.result;
					console.log(result);
					for(var i = 0;i < result.length;i++){
						var thisDiv = document.createElement('div');
						for(var name in result[i]){
							switch(name){
								case 'trainno':sxName = "火车号";break;
								case 'type':sxName = '类型';break;
								case 'station':sxName = '起始地';break;
								case 'arrivaltime':sxName = '到达时间';break;
								case 'costtime':sxName = '预计用时';break;
								case 'distance':sxName = '距离(KM)';break;
								case 'departuretime':sxName = '发车时间';break;
								case 'endstation':sxName = '目的地'; break;
								default: continue;
							}
							thisDiv.innerHTML += sxName + ':' + result[i][name] + ' | ';
						}
						$('#userData').append(thisDiv);
					}
					break;
				case 'shouji':
					if(data.status === '201' || data.status === '202' || data.status ==='203'){
						alert('手机号码为空或错误！');
						return;
					}
					var result = data.result;
					for(var name in result){
						switch(name){
							case 'city': sxName = '城市'; break;
							case 'cardtype': sxName = '卡类型'; break;
							case 'province': sxName = '省份'; break;
							case 'company': sxName = '服务商'; break;
						}
						$('#userData').append(function(){
							var p = document.createElement('p');
							p.innerHTML = sxName + ' : ' + result[name];
							return p; 
						});
					}
					break;
				case 'tv':
					result = data.result.program;
					for(var i = 0;i < result.length;i++){
						var thisDiv = document.createElement('div');
						for(var name in result[i]){
							switch(name){
								case 'name': sxName = '节目名称'; break;
								case 'starttime': sxName = '开始时间'; break;
							}
							thisDiv.innerHTML += sxName + ' : ' + result[i][name] + '|';
						}
						$('#userData').append(thisDiv);
					}
					break;
				case 'idcard':
					if(data.status === '201' || data.status === '202' || data.status ==='203'){
						alert('身份证号码为空或错误！');
						return;
					}
					result = data.result;
					for(var name in result){
						switch(name){
							case 'province': sxName = '省份';break;
							case 'city': sxName = '城市'; break;
							case 'town': sxName = '镇/县'; break;
							case 'sex': sxName = '性别'; break;
							case 'birth': sxName = '出生日期'; break;
							default: continue;
						}
						var p = document.createElement('p');
						p.innerHTML = sxName + ' : ' + result[name];
						$('#userData').append(p);
					}
					break;
				case 'express':
					if(data.status === '205'){
						alert('没有信息！');
						return;
					}
					result = data.result.list;
					var ifIssign = data.result.issign;
					var p = document.createElement('p');
					$(p).css({
						fontSize: '20px',
						fontWeight: 'bold',
						fontColor: '#000000'
					});
					//console.log(ifIssign);
					if(ifIssign == "1")
						p.innerHTML = '已经收取快件!';
					else 
						p.innerHTML = '暂无签收!';
					$('#userData').append(p);
					for(var i = 0; i < result.length;i++){
						var thisDiv = document.createElement('div');
						for(var name in result[i]){
							console.log(name);
							switch(name){
								case 'time': sxName = '时间';break;
								case 'status' : sxName = '状态';break;
							}
							thisDiv.innerHTML += sxName + ' : ' + result[i][name] + '</br>';
							$('#userData').append(thisDiv);
						}
						$('#userData').append('</br>');
					}
					break;	
			}
		}
	}
}());