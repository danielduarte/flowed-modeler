#!/bin/bash
#
# Resolve the location of the Flowed Modeler installation.
# This includes resolving any symlinks.

PRG=$0
while [ -h "$PRG" ]; do
    ls=`ls -ld "$PRG"`
    link=`expr "$ls" : '^.*-> \(.*\)$' 2>/dev/null`
    if expr "$link" : '^/' 2> /dev/null >/dev/null; then
        PRG="$link"
    else
        PRG="`dirname "$PRG"`/$link"
    fi
done

FLOWED_MODELER_BIN=`dirname "$PRG"`

# absolutize dir
oldpwd=`pwd`
cd "${FLOWED_MODELER_BIN}"
cd ".."
FLOWED_MODELER_BIN=`pwd`
cd "${oldpwd}"

ICON_NAME=flowed-modeler
TMP_DIR=`mktemp --directory`
DESKTOP_FILE=$TMP_DIR/flowed-modeler.desktop
cat << EOF > $DESKTOP_FILE
[Desktop Entry]
Version=1.0
Encoding=UTF-8
Name=Flowed Modeler
Keywords=flowed;modeler;orchestration
GenericName=Flow Modeling Tool
Type=Application
Categories=Development
Terminal=false
StartupNotify=true
Path=$FLOWED_MODELER_BIN
Exec="$FLOWED_MODELER_BIN/flowed-modeler" %F
MimeType=application/flowed
Icon=$ICON_NAME.png
X-Ayatana-Desktop-Shortcuts=NewWindow;RepositoryBrowser
EOF

# seems necessary to refresh immediately:
chmod 644 $DESKTOP_FILE

echo "Installing icons and desktop entry..."
xdg-desktop-menu install $DESKTOP_FILE
xdg-icon-resource install --size  16 "$FLOWED_MODELER_BIN/support/icon_16.png"  $ICON_NAME
xdg-icon-resource install --size  48 "$FLOWED_MODELER_BIN/support/icon_48.png"  $ICON_NAME
xdg-icon-resource install --size 128 "$FLOWED_MODELER_BIN/support/icon_128.png"  $ICON_NAME
echo "Registering mime types..."
xdg-mime install "$FLOWED_MODELER_BIN/support/mime-types.xml"

rm $DESKTOP_FILE
rm -R $TMP_DIR

echo "Done."
