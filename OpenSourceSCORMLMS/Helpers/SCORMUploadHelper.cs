using adlcp_rootv1p2;
using adlcp_rootv1p2.imscp;
using imsmd_rootv1p2p1;
using adlcp_v1p3;
using imscp_v1p1;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Xml;
using System.Linq;
using System;

namespace OpenSourceSCORMLMS.Helpers
{
    /// <summary>
    /// Get some information about the course from the imsmanifest`.xml file
    /// </summary>
    public class SCORMUploadHelper
    {
        public string identifier { get; set; }
        public string title { get; set; }
        public string SCORM_Version { get; set; } // will either be 1.2 or one of the synonyms for SCORM 2004
        public string version { get; set; } // this is the creator's version
        public string description { get; set; }
        public string href { get; set; }
        private ILogger logger { get; set; }
        public SCORMUploadHelper(ILogger logger)
        {
            this.logger = logger;
        }

        public void parseManifest(string pathToManifest)
        {
            string XMLPath = pathToManifest;
            string XMLDirectory = System.IO.Path.GetDirectoryName(pathToManifest);
            if (!System.IO.File.Exists(XMLPath))
            {
                logger.LogWarning("Manifest file not found!");
            }
            adlcp_rootv1p2Doc doc = new adlcp_rootv1p2Doc();
            adlcp_rootv1p2.imscp.manifestType root = new adlcp_rootv1p2.imscp.manifestType(doc.Load(XMLPath));
            this.identifier = root.identifier.Value;
            // SCORM version should be in the metadata. It should have the following values:
            //   Schema: ADL SCORM
            //   SchemaVersion: 1.2
            // for SCORM2004 it will say "1.3" or "CAM 1.3"
            // unfortunately I have seen a lot of manifests without this which forces you to guess
            if (root.Hasmetadata())
            {
                adlcp_metadataType meta = root.Getmetadata();

                if (meta.Hasschemaversion())
                {
                    // this is the way we SHOULD get the version but some manifests don't have this
                    SCORM_Version = meta.schemaversion.Value;
                }
            }
            if (SCORM_Version == string.Empty || SCORM_Version == null)
            {
                SCORM_Version = this.GetSCORMVersion(root); //backwards way to get the version
            }
            
            if (SCORM_Version == "1.2")
            {
                logger.LogInformation("Module is SCORM 1.2");
                adlcp_rootv1p2.imscp.versionType versionType;
                if (root.Hasversion())
                {
                    versionType = root.Getversion(); // this is the manifest's creator's version of this manifest, not SCORM version
                }
                else
                {
                    versionType = new adlcp_rootv1p2.imscp.versionType("1.0");
                }

                version = versionType.Value;
                title = identifier; //this will become the course title unless there is one in Organizations (should be!)
                if (root.Hasmetadata())
                {
                    adlcp_metadataType md = root.Getmetadata();
                    if (md.HasLOM())
                    {
                        if (md.LOM.Hasgeneral())
                        {
                            if (md.LOM.general.Hasdescription())
                            {
                                description = md.LOM.general.description.ToString();
                            }
                        }
                    }
                }
                href = FindDefaultWebPage(root);

            } // end if version == 1.2
            else if (SCORM_Version == "1.3" || SCORM_Version == "CAM 1.3" || SCORM_Version.IndexOf("2004") >= 0)
            {
                logger.LogInformation("Module is SCORM2004");
                adlcp_v1p3Doc doc2 = new adlcp_v1p3Doc();
                manifestTypeExtended root2 = new manifestTypeExtended(doc2.Load(XMLPath));
                identifier = root.Getidentifier().Value;
                title = identifier;
                version = root.Getversion().Value;
                // Now we start looking for the default web page. Organizations => organization => item
                // get the identifierref for the first item
                // then find that identifier in resources => resource. That resource.href is the default launching page for the sco

                // get all organizations for this manifest. "Organizations" is a container for "Organization" objects
                //
                href = FindDefaultWebPage(root);
            }
            else
            {
                logger.LogInformation("Manifest version is " + SCORM_Version + ". Must be 1.2 or 1.3");
                return;
            }
            logger.LogInformation("Parse of manifest completed successfully");
            return;
        }

        private string FindDefaultWebPage(adlcp_rootv1p2.imscp.manifestType root)
        {
            if (root.Hasorganizations())
            {
                adlcp_rootv1p2.imscp.organizationsType orgs = root.Getorganizations();
                if (orgs.Hasorganization()) // its possible but fatal to have a blank "organizations" node
                {
                    string org_default = "";
                    if (orgs.Hasdefault2())
                    {
                        org_default = orgs.default2.ToString();
                        var org = FindDefaultOrg(org_default, orgs);
                        string identifier1 = "";
                        if (org.Hasidentifier())
                            identifier1 = org.Getidentifier().ToString();
                        if (org.Hastitle())
                        {
                            title = org.Gettitle().ToString();
                        }
                        if (org.Hasitem())
                        {
                            int i = org.GetitemCount();
                            if (i > 0)
                            {
                                adlcp_itemType item = org.GetitemAt(0);
                                adlcp_rootv1p2.imscp.identifierrefType2 item_identifier = item.identifierref;
                                //
                                // find the resource for this item
                                //
                                adlcp_rootv1p2.imscp.resourceType resource = FindDefaultResource(item_identifier, root.resources);
                                if (resource.Hashref())
                                {
                                    href = resource.href.ToString();
                                    return href;
                                }
                            }
                        }
                    }
                }
            } // end of "organizations" object
            return "";

        }

        private adlcp_rootv1p2.imscp.resourceType FindDefaultResource(identifierrefType2 item_identifier, adlcp_rootv1p2.imscp.resourcesType resources)
        {
            adlcp_rootv1p2.imscp.resourceType rs_empty = new adlcp_rootv1p2.imscp.resourceType();
            for (int ii = 0; ii < resources.resourceCount; ii++)
            {
                adlcp_rootv1p2.imscp.resourceType rs = resources.GetresourceAt(ii);

                string identifier = "";
                if (rs.Hasidentifier())
                    identifier = rs.identifier.ToString();
                if (identifier == item_identifier.ToString())
                {
                    return rs;
                }
            }
            return rs_empty;
        }

        /// <summary>
        /// get the SCORM version by examining the namespace declaration
        /// People have misused the "Version" attribute so you can't depend on it.
        /// Version SHOULD be in the metadata but some people don't even include that.
        /// </summary>
        /// <param name="?"></param>
        /// <returns></returns>
        private string GetSCORMVersion(adlcp_rootv1p2.imscp.manifestType root)
        {
            string version = "unknown";
            XmlNode node = root.getDOMNode();
            foreach (XmlNode attr in node.Attributes)
            {
                if (attr.Name.ToLower() == "xmlns:adlcp")
                {
                    string ns = attr.Value;
                    switch (ns.ToLower())
                    {
                        case "http://www.adlnet.org/xsd/adlcp_rootv1p1":
                            version = "1.1";
                            break;
                        case "http://www.adlnet.org/xsd/adlcp_rootv1p2":
                            version = "1.2";
                            break;
                        case "http://www.adlnet.org/xsd/adlcp_v1p3":
                            version = "1.3";
                            break;
                    }
                    return version;
                }

            }
            return version;
        }

        private adlcp_rootv1p2.imscp.organizationType FindDefaultOrg(string org_default, adlcp_rootv1p2.imscp.organizationsType orgs)
        {
            adlcp_rootv1p2.imscp.organizationType org_empty = new adlcp_rootv1p2.imscp.organizationType();
            foreach (var org in orgs.Myorganizations)
            {
                if (org.identifier.ToString() == org_default)
                {
                    return org;
                }
            }
            return org_empty;
        }
    }
}
