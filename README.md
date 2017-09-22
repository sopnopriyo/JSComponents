# JSComponents
Sister library to https://github.com/picoded/JavaCommons

# Mantras
+ Every component should be isolated and avoid external dependencies like the plague.
+ Assume that as a component, you will be included in webpack, unless your inside "backend" namespace.
+ If an external dependency module is needed, ensure its isolated and mapped with "=" versioning.
	+ I think many of us had enough auto-upgrade breaking surprises

# Target use case
+ Frontend vue components
+ Misc javascripts

# Notes
This replaces the internal PageComponent project