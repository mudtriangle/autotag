function transcript_dependent() {
    if (this.checked) {
        $('input.transcript_dependent').prop('disabled', false);
    } else {
        $('input.transcript_dependent').prop('disabled', true);
        $('input.transcript_dependent').prop('checked', false);
    }
}

function execute() {
    var values = $(this).serializeArray();
    console.log(values);
}

function update_time() {
    var vals = $('input[type="checkbox"]').serializeArray();
    var str_options = '';
    
    $(vals).each(function(i, val) {
        str_options = str_options +  ' ' + val.value;
    });

    var get_media_duration = evalScript('$._ext.get_all_media_duration()', function(res) {
        var curr_time = res.split(':');
        var seconds = parseInt(curr_time[0]) * 3600
                        + parseInt(curr_time[1]) * 60
                        + parseInt(curr_time[2]);
        var multiplier = 0.0;

        if (str_options.includes('get_ltc')) {
            multiplier += 0.007;
        }
        if (str_options.includes('get_transcript')) {
            multiplier += 0.33;
        }
        if (str_options.includes('get_scenes')) {
            multiplier += 0.02;
        }
        if (str_options.includes('get_markers')) {
            multiplier += 0.01;
        }
        if (str_options.includes('get_shot')) {
            multiplier += 0.4;
        }

        seconds = Math.floor(seconds * multiplier);
        var hours = Math.floor(seconds / 3600);
        seconds = seconds % 3600;
        var minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

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

        $('div[id="time_summary"]').empty();
        $('div[id="time_summary"]').append('ETA: ' + hours_str
                                            + ':' + minutes_str
                                            + ':' + seconds_str);
    });
}

function write_to_project() {
    var exists = evalScript("$._ext.check_if_exists()");

    var vals = $('input[type="checkbox"]').serializeArray();
    var str_options = '';
    
    $(vals).each(function(i, val) {
        str_options = str_options +  ' ' + val.value;
    });
    
    var path_to_screenplay = $('#screenplay_path').text();

    evalScript("$._ext.write_to_project('"
                + path_to_screenplay + "', '"
                + str_options + "', '"
                + exists.toString() + "')");
}

function run_python_script() {
    evalScript("$._ext.run_python_script()", write_to_project);
}

function get_structure() {
    var exists;
    evalScript("$._ext.check_if_exists()", function(res) {
        exists = res;
        evalScript("alert('" + exists + "')");
    });

    var vals = $('input[type="checkbox"]').serializeArray();
    var str_options = '';
    
    $(vals).each(function(i, val) {
        str_options = str_options +  ' ' + val.value;
    });
    
    var path_to_screenplay = $('#screenplay_path').text();
    evalScript("$._ext.get_structure('"
                + path_to_screenplay + "', '"
                + str_options + "', '"
                + exists.toString() + "')",
                run_python_script);

    evalScript("$._ext.write_to_project('"
                + path_to_screenplay + "', '"
                + str_options + "', '"
                + exists.toString() + "')");
}

function get_screenplay() {
    var get_scrplay = evalScript('$._ext.get_screenplay()', function(res) {
        $('div[id="screenplay_path"]').empty();
        $('div[id="screenplay_path"]').append(res);
    });
}

function run_main() {
    evalScript("$._ext.check_if_exists()", function(res) {
        var exists = res;
        var vals = $('input[type="checkbox"]').serializeArray();
        var str_options = '';
        
        $(vals).each(function(i, val) {
            str_options = str_options +  ' ' + val.value;
        });

        var path_to_screenplay = $('#screenplay_path').text();
        evalScript("$._ext.get_structure('"
                   + path_to_screenplay + "', '"
                   + str_options + "', '"
                   + exists + "')",
                   function() {
                       evalScript("$._ext.run_python_script()", function(res) {
                           evalScript("$._ext.write_to_project('"
                                      + path_to_screenplay + "', '"
                                      + str_options + "', '"
                                      + exists + "')");
                       });
                   });

    });
}

function create_bins_scene() {
    evalScript("$._ext.create_bins_by_scene()");
}

function create_bins_shot() {
    evalScript("$._ext.create_bins_by_shot()");
}
