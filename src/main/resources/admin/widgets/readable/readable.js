/**
 * Created by zulfeekar.cheriyampu on 22/03/2018.
 */
var portalLib = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var i18nLib = require('/lib/xp/i18n');
var contentLib = require('/lib/xp/content');

exports.get = function (req) {

    var uid = req.params.uid || 'uid-com-bouvet-widgets-enonic-readable';

    var contentId = req.params.contentId;
    if (!contentId) {
        contentId = portalLib.getContent()._id;
    }
    var content = contentLib.get({
        key: contentId
    });



    var locale = 'en';
    if(content.language){
        locale = content.language.split('_')[0];
    }

    //log.info('content-id === %s ',content._id);
    //log.info('locale === %s ',locale);

    var model = {};
    model.data = {};

    var labels = {
        analyze: i18nLib.localize({key: 'Labels.Readable.analyze', locale: locale}),
        averageScore: i18nLib.localize({key: 'Labels.Readable.average-score', locale: locale}),
        gradeLevel: i18nLib.localize({key: 'Labels.Readable.grade-level', locale: locale}),
        readingLevel: i18nLib.localize({key: 'Labels.Readable.reading-level', locale: locale}),
        veryEasy: i18nLib.localize({key: 'Labels.Readable.very-easy', locale: locale}),
        easy: i18nLib.localize({key: 'Labels.Readable.easy', locale: locale}),
        fairlyEasy: i18nLib.localize({key: 'Labels.Readable.fairly-easy', locale: locale}),
        standard: i18nLib.localize({key: 'Labels.Readable.standard', locale: locale}),
        fairlyDifficult: i18nLib.localize({key: 'Labels.Readable.fairly-difficult', locale: locale}),
        difficult: i18nLib.localize({key: 'Labels.Readable.difficult', locale: locale}),
        veryConfusing: i18nLib.localize({key: 'Labels.Readable.very-confusing', locale: locale})
    }

    model.uid = uid;
    model.data.labels = labels;

    var view = resolve('readable.html');

    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    }
};
