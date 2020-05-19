function get_scene_string(scene) {
    var scene_str = "custom_scene_";

    if (scene == "-1") {
        return scene_str + "UNKNOWN";
    } else {
        var len_digs = scene.length;
        for (var i = 0; i < 6 - len_digs; i++) {
            scene_str = scene_str + '0';
        }

        return scene_str + scene;
    }
}


function get_shot_string(shot) {
    var shot_str = "custom_shot_";

    if (shot == "Not recognized") {
        return shot_str + "UNKNOWN";
    }

    var return_val = shot_str;
    var shot_list = shot.split(' or ');

    for (var i = 0; i < shot_list.length; i++) {
        switch (shot_list[i]) {
            case "close-up":
                return_val = return_val + "CLOSEUP";
                break;
            case "medium close-up":
                return_val = return_val + "MEDIUMCLOSEUP";
                break;
            case "medium":
                return_val = return_val + "MEDIUM";
                break;
            case "american":
                return_val = return_val + "AMERICAN";
                break;
            case "long":
                return_val = return_val + "LONG";
                break;
        }

        if (i < shot_list.length - 1) {
            return_val = return_val + ";" + shot_str;
        }
    }

    return return_val;
}


function create_markers(item, transcript) {
    var markers = item.getMarkers();

    for (var key in transcript) {
        var curr_marker = markers.createMarker(parseInt(key))
        curr_marker.name = "custom_marker_TRANSCRIPT";
        curr_marker.comments = transcript[key].join(' ');
    }
}
