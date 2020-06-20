which -s brew
if [[ $? != 0 ]] ; then
	echo "Installing homebrew..."
	ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else
	echo "Updating homebrew..."
	brew update
fi

echo "Installing ltctools..."
brew install ltc-tools

echo "Installing ffmpeg..."
brew install ffmpeg

echo "Installing python 3.8..."
brew install python@3.8

echo "Installing svn..."
brew install svn

echo "Installing AutoTag..."
cd "/Library/Application Support/Adobe/CEP/extensions"
mkdir autotag
svn checkout https://github.com/mudtriangle/autotag/trunk/autotag
cd autotag
pip install -r requirements.txt
chmod 777 "/Library/Application Support/Adobe/CEP/extensions/autotag/test.command"
