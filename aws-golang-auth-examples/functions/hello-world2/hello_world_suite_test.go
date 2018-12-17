package main_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestHelloWorld(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "HelloWorld Suite")
}
