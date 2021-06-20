
// export const 多重笛卡尔积 = (arr: any[]) => arr.reduce((as, bs) => as.map(a => bs.map(b => [...a, b])).flat(), [[]])


export const 数组去重 = (判别式: (a: any, b: any) => boolean, 数组: any[]) => {
    var 包含 = (判别式: (a: any, b: any) => boolean, 项: any, 数组: any[]) => {
        for (var i = 0; i < 数组.length; i++) {
            if (判别式(数组[i], 项))
                return true
        }
        return false
    }

    var r = []
    for (var i = 0; i < 数组.length; i++) {
        if (!包含(判别式, 数组[i], r))
            r.push(数组[i])
    }
    return r
}
