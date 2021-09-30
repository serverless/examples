plugins {
    kotlin("jvm") version "1.5.31"
}

repositories {
    mavenCentral()
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "11"
        freeCompilerArgs = freeCompilerArgs + arrayOf("-Xjsr305=strict")
    }
}

dependencies {
    implementation(kotlin("stdlib"))
    implementation("com.amazonaws:aws-lambda-java-events:3.10.0")
    implementation("com.amazonaws:aws-lambda-java-core:1.2.1")
    implementation("com.amazonaws:aws-lambda-java-log4j:1.0.1")
}

// https://docs.aws.amazon.com/lambda/latest/dg/java-package.html
tasks.register<Zip>("zip") {
    archiveFileName.set("${project.name}.zip")
    from(sourceSets.main.get().output)
    into("lib") { from(configurations.runtimeClasspath) }
}
tasks.build {
    dependsOn("zip")
}
