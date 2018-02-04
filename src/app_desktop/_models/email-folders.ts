export class EmailFolders {
    folders: string[];
    allMailFolder: string;
    representation: string[];

    constructor(data?: any) {

        this.folders = [];
        this.representation = [];
        this.allMailFolder = '';

        if (data && data.length) {
            let allMailFolderFlag = true;

            data.forEach((item, index) => {
                let delimiter = /(.+)\/(.+)/g;
                let path = delimiter.exec(item);

                if (path) {

                    this.representation.push(path.slice(-1)[0]);
                    this.folders.push(item);

                    if (allMailFolderFlag) {
                        this.allMailFolder = item;
                        allMailFolderFlag = false;
                    }

                } else if (index < 1) {

                    this.representation.push(item);
                    this.folders.push(item);
                }
            });
        }
    }

    isNotEmpty() {
        return !!this.folders.length;
    }
}

interface EmailFolderRepresentation {
    root: string;
    index: number;
    subfolders?: EmailFolderRepresentationSubfolder;
}

interface EmailFolderRepresentationSubfolder {
    root: string;
    index: number;
}