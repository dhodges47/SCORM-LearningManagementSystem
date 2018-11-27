using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OpenSourceSCORMLMS.Helpers
{
    public class FileSystemHelper
    {


        // note sPath is the complete physical path including the filename
        // returns blank if the file doesn't exist
        public static string getUniqueFileName(string sPath)
        {
            if (!File.Exists(sPath))
            {
                return "";
            }
            string sFileNameWithoutExtension = Path.GetFileNameWithoutExtension(sPath);
            string sPathWithoutFileName = Path.GetDirectoryName(sPath);
            string extension = Path.GetExtension(sPath);
            for (int i = 1; i < 1000; i++)
            {
                string newName = $"{sFileNameWithoutExtension}({i.ToString()}){extension}";
                if (!File.Exists($"{sPathWithoutFileName}/{newName}"))
                {
                    return newName;
                }
            }
            return ""; // shouldn't get here
        }
        public static Tuple<string, string> getUniqueFolderName(string sPath, string sFolderName)
        {
            string sFullPath = Path.Combine(sPath, sFolderName);
            if (!Directory.Exists(sFullPath))
            {
                // folder doesn't exist, we're good to go
                return new Tuple<string, string>(sFullPath, sFolderName);
            }

            for (int i = 1; i < 1000; i++)
            {
                string newName = $"{sFolderName}({i.ToString()})";
                string newPath = $"{sPath}{newName}";
                if (!Directory.Exists(newPath))
                {
                    return new Tuple<string, string>(newPath, newName);
                }
            }
            return new Tuple<string, string>(sFullPath, sFolderName); // shouldn't get here
        }

        public static string FindIndexFile(string sPathToPackageFolder)
        {
            // returns relative path to index.html
            DirectoryInfo di = new DirectoryInfo(sPathToPackageFolder);
            string relativePath = WalkDirectoryTree(di, "index.html", true);
            return relativePath;
        }

        public static string FindManifestFile(string sPathToPackageFolder)
        {
            // returns full path to imsmanifest.xml
            DirectoryInfo di = new DirectoryInfo(sPathToPackageFolder);
            string fullPath = WalkDirectoryTree(di, "imsmanifest.xml", false);
            return fullPath;
        }
        static string WalkDirectoryTree(System.IO.DirectoryInfo root, string sFileNameToSearchFor, bool bReturnRelativePath)
        {
            System.IO.FileInfo[] files = null;
            System.IO.DirectoryInfo[] subDirs = null;

            // First, process all the files directly under this folder
            try
            {
                files = root.GetFiles("*.*");
            }
            // This is thrown if even one of the files requires permissions greater
            // than the application provides.
            catch (UnauthorizedAccessException e)
            {
                Console.WriteLine(e.Message);
            }

            catch (System.IO.DirectoryNotFoundException e)
            {
                Console.WriteLine(e.Message);
            }

            if (files != null)
            {
                foreach (System.IO.FileInfo fi in files)
                {
                    if (fi.Name == sFileNameToSearchFor)
                    {
                        string fullpath = Path.GetFullPath(fi.FullName);
                        string relativePath = Path.GetRelativePath(Helpers.ConfigurationHelper.UploadFolder, fullpath);
                        if (bReturnRelativePath)
                        {
                            return relativePath;
                        }
                        else
                        {
                            return fullpath;
                        }
                    }
                }

                // Now find all the subdirectories under this directory.
                subDirs = root.GetDirectories();

                foreach (System.IO.DirectoryInfo dirInfo in subDirs)
                {
                    // Resursive call for each subdirectory.
                    string sPath = WalkDirectoryTree(dirInfo, sFileNameToSearchFor, bReturnRelativePath);
                    if (!string.IsNullOrWhiteSpace(sPath))
                    {
                        return sPath;
                    }
                }
            }
            return "";
        }
    }
}


