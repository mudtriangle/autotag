#include "project_structure.jsx";


function main() {
    var work_dir = File($.fileName).parent.parent.toString();

    // var ps = new ProjectStructure();
    // ps.populate_structure(app.project.rootItem);
    // ps.save_file_structure_to_JSON(work_dir + '/structure.json');

    // var f = File(work_dir + '/call_python.command');
    // f.execute();

    // alert(work_dir + '/call_python.command');

    var ps = new ProjectStructure();
    ps.load_structure(work_dir + '/structure.json');
    ps.write_to_project(app.project.rootItem);
}


main();
