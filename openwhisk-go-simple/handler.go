package main

import "encoding/json"
import "fmt"
import "os"

func main() {
	// native actions receive one argument, the JSON object as a string
	arg := os.Args[1]

	// unmarshal the string to a JSON object
	var obj map[string]interface{}
	json.Unmarshal([]byte(arg), &obj)
	name, ok := obj["name"].(string)
	if !ok {
		name = "Stranger"
	}
	msg := map[string]string{"msg": ("Hello, " + name + "!")}
	res, _ := json.Marshal(msg)
	fmt.Println(string(res))
}
