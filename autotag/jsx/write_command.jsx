function file_with_command(file_path, command) {
    var f = File(file_path);
    f.open('w');
    f.write(command);
    f.close();
    
    return f;
}
