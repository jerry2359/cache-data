/**
 * 数据缓存
 * 作者：Jerry
 * 修改时间：2018-08-17
 * 依赖jQuery
 * @type {{data: {}, setKeys: Function, saveData: Function, removeData: Function, getData: Function, hasData: Function, tryThrow: Function, tryThrowRepet: Function, log: Function, localStorage: {setItem: Function, getItem: Function, removeItem: Function, clear: Function}}}
 */
;(function (window, $, undefined) {

    $.extend({
        cacheData: {

            //缓存容器
            data: {},

            /**
             * 声明在缓存容器中的key值，即命名空间
             * 注：每个命名空间必须先做声明之后才能使用，且每个命名空间只能声明一次
             * @param keys
             * @param dataType
             * @returns {cacheData}
             */
            'setKeys': function(keys, dataType) {
                var _this = this;
                //获取一个完全独立的命名空间，默认是数组类型 []
                var getNamespace = function(type) {
                    return {
                        '[object Undefined]': [], '[object Array]': [], '[object Object]': {}, '[object String]': ''
                    }[Object.prototype.toString.call(type)];
                };
                switch (Object.prototype.toString.call(keys)) {
                    case '[object String]':
                        _this.tryThrowRepet(keys);
                        _this.data[keys] = getNamespace(dataType);
                        break;
                    case '[object Array]':
                        keys.forEach(function(key) {
                            _this.tryThrowRepet(key);
                            _this.data[key] = getNamespace(dataType);
                        });
                        break;
                    case '[object Object]':
                        for (var key in keys) {
                            _this.tryThrowRepet(key);
                            _this.data[key] = getNamespace(keys[key]);
                        }
                        break;
                }
                return _this;
            },

            /**
             * 存储数据
             * @param key
             * @param value
             * @param isAdd
             * @returns {cacheData}
             */
            'saveData': function(key, value, isAdd) {
                var _this = this,
                    keys = key.split('/'),
                    target;

                var merge = function(target) {
                    var result = null;
                    if (Object.prototype.toString.call(target) === '[object Array]') {
                        result = target.concat(value);
                    } else {
                        result = $.extend(true, target, value);
                    }
                    return result;
                };

                _this.tryThrow(keys[0]);
                if (typeof value === 'object') {
                    //是否在原来的数据基础上追加新数据 isAdd
                    if (keys.length > 1) {
                        target = _this.data[keys[0]][keys[1]];
                        if (isAdd && !!target) {
                            _this.data[keys[0]][keys[1]] = merge(target);
                        } else {
                            _this.data[keys[0]][keys[1]] = $.extend(true, Object.prototype.toString.call(value) === '[object Object]' ? {} : [], value);
                        }
                    } else {
                        target = _this.data[key];
                        if (isAdd && !!target) {
                            _this.data[key] = merge(target);
                        } else {
                            _this.data[key] = $.extend(true, Object.prototype.toString.call(value) === '[object Object]' ? {} : [], value);
                        }
                    }
                } else {
                    if (keys.length > 1) {
                        _this.data[keys[0]][keys[1]] = value;
                    } else {
                        _this.data[key] = value;
                    }
                };
                return _this;
            },

            /**
             * 删除数据
             * 参数支持字符串(单个)；数组(多个)；json对象(多个)
             * @param key
             * @returns {cacheData}
             */
            'removeData': function(key) {
                var _this = this,
                    removeKey = -1,
                    parent;

                var remove = function(curKeys) {
                    if (curKeys[0] === 'root') {//curKeys[0]值为root时，则会强制指向跟节点
                        curKeys = [curKeys[1]];
                    }
                    if (curKeys.length > 1) {
                        parent = _this.data[curKeys[0]];
                        removeKey = 1;
                    } else {
                        parent = _this.data;
                        removeKey = 0;
                    };

                    switch (Object.prototype.toString.call(parent)) {
                        case '[object Array]':
                            var inArrayIndex = $.inArray(parent[curKeys[removeKey]], parent);
                            inArrayIndex >= 0 && parent.splice(inArrayIndex, 1);
                            break;
                        case '[object Object]':
                            delete parent[curKeys[removeKey]];
                            break;
                    };
                };

                switch (Object.prototype.toString.call(key)) {
                    case '[object String]':
                        remove(key.split('/'));
                        break;
                    case '[object Array]':
                        key.forEach(function(key) {
                            remove(key.split('/'));
                        });
                        break;
                    case '[object Object]':
                        for (var attr in key) {
                            remove([attr, key[attr]]);
                        };
                        break;
                };

                return _this;
            },

            /**
             * 取数据
             * @param key
             * @returns {*}
             */
            'getData': function(key) {
                var _this = this,
                    keys = key.split('/'),
                    result, tmpRes;

                _this.tryThrow(keys[0]);
                if (keys.length > 1) {
                    tmpRes = _this.data[keys[0]][keys[1]];
                } else {
                    tmpRes = _this.data[key];
                };
                if (typeof tmpRes === 'object') {
                    result = $.extend(true, Object.prototype.toString.call(tmpRes) === '[object Object]' ? {} : [], tmpRes);
                } else {
                    result = tmpRes;
                };
                return result;
            },

            /**
             * 判断存储中是否有该数据
             * @param key
             * @returns {boolean}
             */
            'hasData': function(key) {
                return !!this.getData(key);
            },

            /**
             * 报错提示
             * @param key
             */
            'tryThrow': function(key) {
                if (this.data[key] === undefined) {
                    throw '请先声明在缓存容器中的key值；\neg: vueBus.dealer.cache.setKeys("'+ key +'", {});';
                };
            },

            /**
             * 报错提示，禁止重复声明
             * @param key
             */
            'tryThrowRepet': function(key) {
                if (this.data[key] !== undefined) {
                    throw 'key值"' + key + '"已经被声明使用，不能再重复声明。';
                };
            },

            /**
             * 打印数据，默认打印过滤之后的数据
             * 参数logTrue，是否打印原始数据
             * @param key
             * @param logTrue
             * @returns {cacheData}
             */
            'log': function(key, logTrue) {
                var _this = this,
                    keys = key.split('/');
                if (keys[0] === 'localStorage') {
                    var storage = window.localStorage,
                        result;
                    if (keys.length === 1) {
                        if (!logTrue) {
                            result = {};
                            for (var attr in storage) {
                                try {
                                    var tmpRes = JSON.parse(storage[attr]);
                                    if (tmpRes.val && tmpRes.type) result[attr] = tmpRes.val;
                                } catch (err) {

                                }
                            }
                        } else {
                            result = storage;
                        }
                        console.log( result );
                    } else {
                        result = JSON.parse(storage.getItem(keys[1]));
                        console.log( logTrue ? result : result.val );
                    }
                } else {
                    console.log( key !== undefined && key !== 'all' ? _this.getData(key) : _this.data );
                }
                return _this;
            },

            /**
             * 本地存储
             */
            'localStorage': {

                /**
                 * 存储数据
                 * @param key
                 * @param val
                 * @param timeout
                 */
                'setItem': function(key, val, timeout) {
                    var storage = window.localStorage,
                        result = {"val": val};

                    if (timeout) {
                        //在每天特定时间点之前有效，特定时间点之后失效
                        if (timeout.everyDay !== undefined) {
                            var myDate = new Date(),
                                pointDate = myDate.getFullYear() + '-' + (myDate.getMonth()+1) + '-' + myDate.getDate() + ' ' + timeout.everyDay;
                            result.type = 'timeout-everyDay';
                            result.everyDay = timeout.everyDay;
                            result.addTime = +new Date();
                            result.timeout = +new Date(pointDate);
                            //如果当前时间大于特定时间点，则应获取明天的特定时间点
                            if (result.addTime > result.timeout) {
                                result.timeout += 24*60*60*1000;
                            }
                        } else if (timeout.asOfDate !== undefined) {
                            //截止日期 之前有效，之后失效
                            result.type = 'timeout-asOfDate';
                            result.asOfDate = timeout.asOfDate;
                            result.addTime = +new Date();
                            result.timeout = +new Date(timeout.asOfDate);
                        } else {
                            //正常的失效时间
                            var timeMap = {'day': 24*60*60*1000, 'hours': 60*60*1000, 'minutes': 60*1000, 'seconds': 1000},
                                timeKey;
                            for (timeKey in timeout) {};
                            result.type = 'timeout-normal';
                            result[timeKey] = timeout[timeKey];
                            result.addTime = +new Date();
                            result.timeout = +new Date() + timeout[timeKey] * timeMap[timeKey];
                        };
                    } else {
                        result.type = 'timeout-infinite';
                    }
                    storage.setItem(key, JSON.stringify(result));
                },

                /**
                 * 获取数据
                 * @param key
                 * @returns {*}
                 */
                'getItem': function(key) {
                    var storage = window.localStorage,
                        result = JSON.parse(storage.getItem(key));

                    if (
                        !result ||
                        (
                            //在每天特定时间点之前有效，特定时间点之后失效
                            //如果当前时间大于特定时间点
                            result.everyDay !== undefined && +new Date() > result.timeout ||
                            //截止日期 之前有效，之后失效
                            result.asOfDate !== undefined && +new Date() > result.timeout ||
                            //正常的失效时间
                            +new Date() > result.timeout
                        )
                    ) {
                        storage.removeItem(key);
                        result = {"val": undefined};
                    }
                    return result.val;
                },

                /**
                 * 删除数据
                 * @param key
                 */
                'removeItem': function(key) {
                    window.localStorage.removeItem(key);
                },

                /**
                 * 清空localStorage
                 */
                'clear': function() {
                    window.localStorage.clear();
                }

            }

        }
    });

})(window, jQuery);