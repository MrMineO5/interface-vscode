import org.apache.tools.ant.taskdefs.condition.Os

plugins {
    id("com.avast.gradle.docker-compose") version "0.16.9"
}

tasks {
    register<Exec>("test") {
        executable = getNpm()
        args("run", "test")
    }
    register("cleanPackDir") {
        file("pack/").mkdirs()
        file("pack/").listFiles()?.forEach { it.delete() }
    }

    register<Exec>("installModules") {
        executable = getNpm()
        args("install")
    }

    register<Exec>("buildDist") {
        dependsOn("cleanPackDir")
        executable = getNpm()
        args("run", "pack")
    }

    register<Exec>("publishPlugin") {
        dependsOn("buildDist")
        executable = getNpm()
        args("run", "publish")
    }
}

dockerCompose {
    removeVolumes.set(true)
    waitForTcpPorts.set(false)
}

// Make npm work on Windows
fun getNpm(): String {
    return if (Os.isFamily(Os.FAMILY_WINDOWS)) {
        "npm.cmd"
    } else {
        "npm"
    }
}
