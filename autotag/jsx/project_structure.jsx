#include "json2.js";
#include "metadata_functions.jsx";

var priv_metadata_uri = "http://ns.adobe.com/premierePrivateProjectMetaData/1.0/";
var log_note = "Column.Intrinsic.LogNote";


if ( ExternalObject.AdobeXMPScript == undefined ) {
    ExternalObject.AdobeXMPScript = new ExternalObject( "lib:AdobeXMPScript");
}

function ProjectStructure(path_to_screenplay, options_str, languages, exists) {
    if (exists != "true") {
        this.file_structure = {
            "settings": {
                "path_to_screenplay": path_to_screenplay,
                "options_str": options_str,
                "languages": languages
                },
            "media": {}
        };

    } else {
        this.file_structure = {};
        var f = File(app.project.path + '.json');

        f.open('r');
        this.file_structure["settings"] = JSON.parse(f.read())["settings"];
        f.close();

        if (path_to_screenplay.length > 0) {
            this.file_structure["settings"]["path_to_screenplay"] = path_to_screenplay;
        }
        
        this.file_structure["settings"]["options_str"] = options_str;
        this.file_structure["settings"]["languages"] = languages;
    }

    this.populate_structure = function(current_item) {
        for (var i = 0; i < current_item.children.numItems; i++) {
            if (current_item.children[i].type == ProjectItemType.BIN) {
                this.populate_structure(current_item.children[i]);

            } else {
                this.file_structure["media"][current_item.children[i].treePath] = {
                    "real_path": current_item.children[i].getMediaPath()
                };
            }
        }
    };

    this.get_file_structure = function() {
        return this.file_structure;
    };

    this.save_file_structure_to_JSON = function(target_path) {
        var f = File(target_path);

        f.open('w');
        f.write(JSON.stringify(this.file_structure, null, 4));
        f.close();
    };

    this.reset_structure = function(current_item) {
        this.file_structure = {};
        this.populate_structure();
    };

    this.load_structure = function(path) {
        var f = File(path);

        f.open('r');
        this.file_structure["media"] = JSON.parse(f.read())["media"];
        f.close();
    }

    this.write_to_project = function(current_item) {
        for (var i = 0; i < current_item.children.numItems; i++) {
            if (current_item.children[i].type == ProjectItemType.BIN) {
                this.write_to_project(current_item.children[i]);

            } else {
                try {
                var t_path = current_item.children[i].treePath;

                if (this.file_structure["media"][t_path]["is_media"] != false) {
                    var metadata = new XMPMeta(current_item.children[i].getProjectMetadata());
                    if (metadata.doesPropertyExist(priv_metadata_uri, log_note)) {
                        var metadata_string = metadata.getProperty(priv_metadata_uri, log_note) + ";";
                    } else {
                        var metadata_string = "";
                    }
                    
                    if (this.file_structure["settings"]["options_str"].indexOf("get_scene") > -1) {
                        metadata_string =
                            metadata_string
                            + get_scene_string(this.file_structure["media"][t_path]["scene"])
                            + ";";
                    }

                    if (this.file_structure["settings"]["options_str"].indexOf("get_shot") > -1) {
                        metadata_string =
                            metadata_string
                            + get_shot_string(this.file_structure["media"][t_path]["type_of_shot"])
                            + ";";
                    }

                    if (this.file_structure["settings"]["options_str"].indexOf("get_markers") > -1) {
                        create_markers(current_item.children[i],
                                    this.file_structure["media"][t_path]["transcript"]);
                    }

                    metadata.setProperty(priv_metadata_uri, log_note, metadata_string);

                    current_item.children[i].setProjectMetadata(metadata.serialize(), [log_note]);
                }
                }
                catch(err) {}
            }
        }
    }
}
