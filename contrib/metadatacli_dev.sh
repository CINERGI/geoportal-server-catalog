#!/bin/bash
# this flag disables logs -Dlog4j.configurationFile=log4j2_cli.properties
# pass one path to file
# -md /data/metadata/hydro10.sdsc.edu/metadata/c4p/c4p_0.xml
#OR
# -json jsonld@dataset file path
# -ext "jsonLD" is embedded in HTML (not yet implemented)
# OPTIONAL
# -v verbose
cd ../geoportal/
mvn -f pom.xml exec:java -Dexec.mainClass="com.esri.geoportal.base.metadata.MetadataCLI" -Dlog4j.configurationFile=log4j2_cli.properties -Dexec.args="%classpath" -Dexec.args="$*"

#java -cp ../geoportal/target/geoportal.jar com.esri.geoportal.base.metadata.MetadataCLI $*