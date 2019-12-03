# keepid_server
Keep.id Server Application. Built with Java and Kotlin, this application serves to empower organizations fighting homelessness with tools to help with document storage and other aid.

How to get the backend service running:
1) make sure you have Java in the JAVA_HOME environment variable
2) make sure you have maven (run "mvn --version" in terminal to check)
3) make sure you have Java 13 JDK/JRE installed. If you wish to have multiple Java versions, look into Java Jabba, which is a Java Version Manager.
4) make sure you install IntelliJ, and install these extensions under File -> Settings -> Plugins:
    - google-java-format (this will help enforce Java code style)
    - Save Actions (this will automatically enforce Java code style on save)
5) make sure that in IntelliJ, maven auto-import is turned on (there will be a pop up usually, or just search up online on how to enable this). You may have to restart IntelliJ multiple times for it to show up
6) under File -> Settings -> Other Settings -> Save Actions, check the first two boxes under General and the first two boxes under Formatting Actions. This will enforce the code style on save
7) under File -> Project Structure -> Modules, set Project SDK and Project Language Level to 13. Additionally, YOU MUST SET YOUR SOURCES, TESTS, TEST RESOURCES, AND EXCLUDED FOLDERS. This step is VERY IMPORTANT, or else nothing will run. Set Source Folders as src/main, Test Source Folders as src/test, Test Resource Folders as src/test/resources, and Excluded Folders as target. Make sure Language level is set to 13. Under the Dependencies tab, make sure the Project SDK is set to 13. 
8) you can run tests or run App
9) check logs in logs/app.log
