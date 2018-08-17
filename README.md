## 用js来缓存数据，封装了具有时效性的localStorage数据

# 引入依赖的脚步文件

```html
<script src="js/jquery.min.js"></script>
<script src="js/cache-data.js"></script>
```

# 缓存在内存变量中的数据操作案例
```js
var cache = $.cacheData;

// ===========在缓存中建立一个键值为welcome的空间，并赋值为hello word!===========
cache.setKeys('welcome', '');
cache.saveData('welcome', 'hello word!');
console.log('键值welcome的缓存值是：' + cache.getData('welcome'));

// ===========在缓存中建立一个键值为welcome2的空间，并赋值为hello word!222===========
cache.setKeys('welcome2', '');
cache.saveData('welcome2', 'hello word!222');
console.log('键值welcome2的缓存值是：' + cache.getData('welcome2'));

// ===========在缓存中建立一个键值为myName的空间，并赋值为Jerry===========
cache.setKeys('myName', '');
cache.saveData('myName', 'Jerry');
console.log('键值myName的缓存值是：' + cache.getData('myName'));

// ===========在缓存中建立一个键值为livingRoom的空间，并赋值为一个对象===========
cache.setKeys('livingRoom', {});
cache.saveData('livingRoom/safa', '沙发');
cache.saveData('livingRoom/tv', '电视');
cache.saveData('livingRoom/kitchen', 'kitchen2');
// 参数3为true时，表示在原来数据的基础上，将参数2的数据合并进去
cache.saveData('livingRoom', {'desk': '桌子', 'flooring': '地板', 'door': '厅门', 'kitchen': '厨房'}, true);
cache.log('livingRoom'); // 用封装的log方法打印livingRoom缓存数据

// ===========在缓存中建立一个键值为bedroom的空间，并赋值为一个对象===========
cache.setKeys('bedroom', {});
cache.saveData('bedroom/bed', {'bedHead': '枕头'});
cache.saveData('bedroom/bed', {'bedFoot': '被子', 'bedBody': '公仔娃娃'}, true);

// ===========在缓存中建立一个键值为washroom的空间，并赋值为一个数组===========
cache.setKeys('washroom');
cache.saveData('washroom/0', '肥皂');
cache.saveData('washroom/1', '沐浴露');
var tess = ['水龙头', '垃圾桶'];
cache.saveData('washroom', tess, true);
tess.length = 0;
cache.saveData('washroom/4', ['洗手台', '镜子']);
cache.saveData('washroom/4', ['洗手台2', '镜子2'], true);
cache.log('washroom');

// 多个设置key
cache.setKeys(['company', 'hobby', 'age'], ''); // 数组形式，适用于多个key，同一种数据类型时
cache.setKeys({'universe': {}, 'earth': [], 'pepole': ''}); // json形式，适用于不同key，不同数据类型时

//单个删除
cache.removeData('washroom/4');
cache.removeData('welcome');
cache.removeData('root/welcome2'); //root指向根节点
cache.removeData('livingRoom/door');
cache.removeData('bedroom');
cache.removeData('bedroom2/door');

//删除多个 参数是数组
cache.removeData(['washroom/2', 'livingRoom/desk']);
//删除多个 参数是json
cache.removeData({'livingRoom': 'safa', 'washroom': '1', 'root': 'myName'});

cache.log('all');
```

# 缓存于localStorage中的数据
```js
var cache = $.cacheData;

//存储之后开始倒计时失效时间
cache.localStorage.setItem('hobby', '游泳'); // 默认无期限
cache.localStorage.setItem('name', 'jerry', {'day': 2}); //天
cache.localStorage.setItem('name2', 'jerry', {'hours': 0.01}); //小时
cache.localStorage.setItem('name3', 'jerry', {'minutes': 1}); //分
cache.localStorage.setItem('name4', 'jerry', {'seconds': 1}); //秒

//存储之后 在每天特定时间点之前有效，特定时间点之后失效
if (!cache.localStorage.getItem('campaign')) {
    cache.localStorage.setItem('campaign', 'vw beetle dune', {'everyDay': '23:59:59'}); //时间格式
    console.log('活动存储不存在，新建一个');
};

//存储之后 在 截止日期 之前有效，之后失效
cache.localStorage.setItem('miaosha', '秒杀抢购活动进行中...', {'asOfDate': '2018/8/17 17:19:30'});

/*setTimeout(function() {
    console.log( cache.localStorage.getItem('name') );
}, (1000*37));*/
/*setInterval(function() {
    console.log(cache.localStorage.getItem('campaign'));
}, 500);*/
setInterval(function() {
    console.log(cache.localStorage.getItem('miaosha'));
}, 500);

//删除数据
cache.localStorage.removeItem('name3');

cache.log('localStorage'); //参数2为true表示打印原始localStorage数据
cache.log('localStorage/name4', true);
```

