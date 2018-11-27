using System;
using System.Collections;
using System.Xml;
using Altova.Types;


namespace adlcp_rootv1p2
{
	/// <summary>
	/// Inherits from imscp_metadataType and adds SCORM types to it
	/// </summary>
	public class adlcp_metadataType: imscp.metadataType
	{

	#region Forward constructors
	public adlcp_metadataType() : base() { SetCollectionParents(); }
	public adlcp_metadataType(XmlDocument doc) : base(doc) { SetCollectionParents(); }
	public adlcp_metadataType(XmlNode node) : base(node) { SetCollectionParents(); }
	public adlcp_metadataType(Altova.Node node) : base(node) { SetCollectionParents(); }
	#endregion // Forward constructors
		
		#region location accessor methods
		public int GetlocationMinCount()
		{
			return 0;
		}

		public int locationMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetlocationMaxCount()
		{
			return 1;
		}

		public int locationMaxCount
		{
			get
			{
				return 1;
			}
		}
		public int GetlocationCount()
		{
			return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location");
		}

		public int locationCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location");
			}
		}

		public bool Haslocation()
		{
			return HasDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location");
		}

		public locationType GetlocationAt(int index)
		{
			return new locationType(GetDomNodeValue(GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location", index)));
		}

		public locationType Getlocation()
		{
			return GetlocationAt(0);
		}

		public locationType location
		{
			get
			{
				return GetlocationAt(0);
			}
		}

		public void RemovelocationAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location", index);
		}

		public void Removelocation()
		{
			while (Haslocation())
				RemovelocationAt(0);
		}

		public void Addlocation(locationType newValue)
		{
			AppendDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location", newValue.ToString());
		}

		public void InsertlocationAt(locationType newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location", index, newValue.ToString());
		}

		public void ReplacelocationAt(locationType newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "location", index, newValue.ToString());
		}
		#endregion // location accessor methods

		#region location collection
		public locationCollection	Mylocations = new locationCollection( );

		public class locationCollection: IEnumerable
		{
			adlcp_metadataType parent;
			public adlcp_metadataType Parent
			{
				set
				{
					parent = value;
				}
			}
			public locationEnumerator GetEnumerator() 
			{
				return new locationEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class locationEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_metadataType parent;
			public locationEnumerator(adlcp_metadataType par) 
			{
				parent = par;
				nIndex = -1;
			}
			public void Reset() 
			{
				nIndex = -1;
			}
			public bool MoveNext() 
			{
				nIndex++;
				return(nIndex < parent.locationCount );
			}
			public locationType  Current 
			{
				get 
				{
					return(parent.GetlocationAt(nIndex));
				}
			}
			object IEnumerator.Current 
			{
				get 
				{
					return(Current);
				}
			}
		}
	
		#endregion // location collection
		protected  override void SetCollectionParents()
		{
			Mylocations.Parent = this; 
			base.SetCollectionParents();
		}

	}
}
