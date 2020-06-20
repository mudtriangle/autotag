/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe. 
**************************************************************************/
#include "jsx/time_calculation.jsx";
#include "jsx/project_structure.jsx";

#include "jsx/moments.js";

if(typeof($)=='undefined'){
	$={};
}

$._ext = {
	create_bins_by_shot: function() {
		var shot_tags = [["Shot: Unknown", "custom_shot_UNKNOWN"],
                         ["Shot: Close-Up", "custom_shot_CLOSEUP"],
                         ["Shot: Medium Close-Up", "custom_shot_MEDIUMCLOSEUP"],
                         ["Shot: Medium", "custom_shot_MEDIUM"],
                         ["Shot: American", "custom_shot_AMERICAN"],
                         ["Shot: Long", "custom_shot_LONG"]];


		for (var i = 0; i < shot_tags.length; i++) {
			app.project.rootItem.createSmartBin(shot_tags[i][0], shot_tags[i][1]);
		}
	},

	create_bins_by_scene: function() {
		var proj_file = File(app.project.path + '.json');
		proj_file.open('r');
		var num_scenes = JSON.parse(proj_file.read())["settings"]["num_scenes"];
		proj_file.close();

		var i = 0;
		while (i < num_scenes) {
			var scene_num = i.toString();
			var len_digs = scene_num.length;
			var scene_str = 'custom_scene_';
			for (var j = 0; j < 6 - len_digs; j++) {
				scene_str = scene_str + '0';
			}
			scene_str = scene_str + scene_num;

			var res = app.project.rootItem.createSmartBin('Scene ' + scene_num, scene_str);
			i++;
		}

		res = app.project.rootItem.createSmartBin('Scene Unknown', 'custom_scene_UNKNOWN');
		if (res == 0) {
				if (str_options.indexOf('bins_by_shot') !== -1) {
					var child_ind = 0;
					for (var j = 0; j < app.project.rootItem.children.length; j++) {
						if (app.project.rootItem.children[j].name == 'Scene Unknown') {
							child_ind = j;
							break;
						}
					}
				}
			}
	},

	write_to_project: function(path_to_screenplay, options_str, exists) {
		ps = new ProjectStructure(path_to_screenplay, options_str, exists);
		ps.load_structure(app.project.path + '.json');

		ps.write_to_project(app.project.rootItem);
	},

	check_if_exists: function() {
		return File(app.project.path + '.json').exists.toString();
	},

	run_python_script: function() {
		command_path = "/Library/Application Support/Adobe/CEP/extensions/autotag/test.command"
		python_path = "/Library/Application Support/Adobe/CEP/extensions/autotag/jsx/test.py"

		var f = File(command_path);
		alert(f.open('w'));
		f.write('python "' + python_path + '" "' + app.project.path + '.json"');
		f.close();

		f.execute();

		return;

		var proj_file = File(app.project.path + '.json');
		proj_file.open('r');
		var settings = JSON.parse(proj_file.read())["settings"];
		var new_exec = new Date(0);

		if ("last_execution" in settings) {
			var old_exec = moment(settings["last_execution"]).toDate();
		} else {
			var old_exec = new Date(0);
		}

		proj_file.close();

		while (true) {
			if (new_exec > old_exec) {
				return "true";
			}

			proj_file.open('r');
			settings = JSON.parse(proj_file.read())["settings"];
			if ("last_execution" in settings) {
				new_exec = moment(settings["last_execution"]).toDate();
			} else {
				new_exec = new Date(0);
			}

			proj_file.close();
			//$.sleep(5000);
		}
	},

	get_screenplay: function() {
		try {
			return File.openDialog('Select Screenplay', '*.fdx', false).fsName;
		} catch(err) {
			return '';
		}
	},

	get_structure: function(path_to_screenplay, options_str, languages, exists) {
		ps = new ProjectStructure(path_to_screenplay, options_str, languages, exists);

		if (exists != "true") {
			ps.populate_structure(app.project.rootItem);
		} else {
			ps.load_structure(app.project.path + '.json');
		}

		ps.save_file_structure_to_JSON(app.project.path + '.json');
	},

	get_all_media_duration: function() {
    	return get_media_duration(app.project.rootItem);
	},

	//Evaluate a file and catch the exception.
	evalFile: function(path) {
		try {
			$.evalFile(path);
		} catch (e) {alert("Exception:" + e);}
	},
	// Evaluate all the files in the given folder 
	evalFiles: function(jsxFolderPath) {
		var folder = new Folder(jsxFolderPath);
		if (folder.exists) {
			var jsxFiles = folder.getFiles("*.jsx");
			for (var i = 0; i < jsxFiles.length; i++) {
				var jsxFile = jsxFiles[i];
				$._ext.evalFile(jsxFile);
			}
		}
	},
	// entry-point function to call scripts more easily & reliably
	callScript: function(dataStr) {
		try {
			var dataObj = JSON.parse(decodeURIComponent(dataStr));
			if (
				!dataObj ||
				!dataObj.namespace ||
				!dataObj.scriptName ||
				!dataObj.args
			) {
				throw new Error('Did not provide all needed info to callScript!');
			}
			// call the specified jsx-function
			var result = $[dataObj.namespace][dataObj.scriptName].apply(
				null,
				dataObj.args
			);
			// build the payload-object to return
			var payload = {
				err: 0,
				result: result
			};
			return encodeURIComponent(JSON.stringify(payload));
		} catch (err) {
			var payload = {
				err: err
			};
			return encodeURIComponent(JSON.stringify(payload));
		}
	}
};
