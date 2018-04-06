/**
 * Created by zulfeekar.cheriyampu on 22/03/2018.
 */
var portalLib = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/xp/thymeleaf');

exports.get = function (req) {
    var uid = req.params.uid;
    var contentId = req.params.contentId;
    var model = {
        uid: uid
    };

    var view = resolve('readable.html');

    return {
        body : thymeleaf.render(view, model),
        contentType: 'text/html'
    }
};
