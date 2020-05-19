var priv_metadata_uri = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
var media_duration = "Column.Intrinsic.MediaDuration";


if ( ExternalObject.AdobeXMPScript == undefined ) {
    ExternalObject.AdobeXMPScript = new ExternalObject( "lib:AdobeXMPScript");
}


function get_clip_duration(item) {
    var metadata = new XMPMeta(item.getProjectMetadata());
    var duration = metadata.getProperty(priv_metadata_uri, media_duration);

    if (duration.value.indexOf(';') > -1) {
        return "00:00:00:00";
    }

    return duration.value;
}

function add_durations(list_of_durations) {
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    for (var i = 0; i < list_of_durations.length; i++) {
        var curr_time = list_of_durations[i].split(':')

        hours += parseInt(curr_time[0]);
        minutes += parseInt(curr_time[1]);
        seconds += parseInt(curr_time[2]);

        if (seconds >= 60) {
            minutes++;
            seconds -= 60;
        }

        if (minutes >= 60) {
            hours++;
            minutes -= 60;
        }

    }

    var hours_str = hours.toString();
    if (hours_str.length < 2) {
        hours_str = '0' + hours_str;
    }

    var minutes_str = minutes.toString();
    if (minutes_str.length < 2) {
        minutes_str = '0' + minutes_str;
    }

    var seconds_str = seconds.toString();
    if (seconds_str.length < 2) {
        seconds_str = '0' + seconds_str;
    }

    return hours_str + ':' + minutes_str + ':' + seconds_str;
}


function get_media_duration(current_item) {
    var media_durations = [];
    for (var i = 0; i < current_item.children.numItems; i++) {
            if (current_item.children[i].type == ProjectItemType.BIN) {
                media_durations.push(get_media_duration(current_item.children[i]));

            } else if (current_item.children[i].type == 4){
                continue;
            } else {
                media_durations.push(get_clip_duration(current_item.children[i]));
            }
        }

    return add_durations(media_durations);
}
