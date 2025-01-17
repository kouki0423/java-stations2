const process = require('process');
const fs = require("fs");
const cp = require('child_process');

function printJunitFormatError(stationId, errorLines) {
    var junitResult = '<?xml version="1.0" ?>\n';
    junitResult += `<testsuite name="Compile" tests="${errorLines.length}" errors="0" failures="${errorLines.length}" time="0.000">\n`;
    errorLines.forEach((line, index) => {
        junitResult += `<testcase classname="Compile" name="error${index + 1}" time="0.000">\n`;
        junitResult += `<failure type="CompileError" message="CompileError">${line}</failure>\n`;
        junitResult += `</testcase>\n`;
    });
    junitResult += `<system-out><![CDATA[stdout!]]></system-out>\n`;
    junitResult += `<system-err><![CDATA[stderr!]]></system-err>\n`;
    junitResult += `</testsuite>`;

    fs.mkdirSync(`internal/station${stationId}/target/surefire-reports/`, { recursive: true });
    fs.writeFileSync(`internal/station${stationId}/target/surefire-reports/TEST-Test${stationId}.xml`, junitResult);
}

const stationId = process.argv[2];
console.log("Start checker for station" + stationId);

const mvnCheckChild = cp.spawnSync(`mvn -v`, [], { shell: true });
if (mvnCheckChild.status !== 0) {
    printJunitFormatError(stationId, ["Mavenがインストールされていません。\nREADME.mdを確認してください。"]);
    return;
}
const child = cp.spawnSync(`mvn clean test-compile -pl internal/station${stationId} -q`, [], { shell: true });
if (child.status === 0) {
    console.log("No compile error. Continue to execute the test.");
    cp.spawnSync(`mvn test -pl internal/station${stationId} -Dtest=Test${stationId}`, [], { shell: true });
    return;
} else {
    console.log("Compile error found.");
    const lines = child.stdout.toString().split("\n");
    const errorLines = [];
    var isCompilationErrorFound = false;
    for(const line of lines) {
        if (line.includes("COMPILATION ERROR")) {
            isCompilationErrorFound = true;
        } else if (line.includes("Failed to execute goal")) {
            break;
        } else if (isCompilationErrorFound && line.startsWith('[ERROR] ')) {
            errorLines.push(line.slice(8).split("/").slice(-1)[0]);
        } else if (isCompilationErrorFound) {
            errorLines.push(errorLines.pop() + "\n" + line);
        }
    }
    printJunitFormatError(stationId, errorLines);
}
