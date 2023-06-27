function read_yaml {
    local yaml_file="$1"
    local yaml_data

    # Read the specified field from the YAML file
     yaml_data=$(yq eval 'select(di=0)' "$yaml_file") 


    # Output the modified value
    echo "$yaml_data" 
}
