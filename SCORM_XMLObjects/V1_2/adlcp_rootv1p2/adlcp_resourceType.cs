using System;
using System.Collections;
using System.Xml;
using Altova.Types;


namespace adlcp_rootv1p2
{
	/// <summary>
	/// adds "scormtype" to the imscp resource type.
	/// </summary>
	public class adlcp_resourceType: imscp.resourceType
	{
		#region Forward constructors
		public adlcp_resourceType() : base() { SetCollectionParents(); }
	public adlcp_resourceType(XmlDocument doc) : base(doc) { SetCollectionParents(); }
	public adlcp_resourceType(XmlNode node) : base(node) { SetCollectionParents(); }
	public adlcp_resourceType(Altova.Node node) : base(node) { SetCollectionParents(); }
	#endregion // Forward constructors
		#region scormtype accessor methods
		public int GetscormtypeMinCount()
		{
			return 1;
		}

		public int scormtypeMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetscormtypeMaxCount()
		{
			return 1;
		}

		public int scormtypeMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetscormtypeCount()
		{
			return DomChildCount(NodeType.Attribute, "", "scormtype");
		}


		public int scormtypeCount
		{
			get
			{
				return DomChildCount(NodeType.Attribute, "", "scormtype");
			}
		}

		public bool Hasscormtype()
		{
			return HasDomChild(NodeType.Attribute, "", "scormtype");
		}

		public SchemaString GetscormtypeAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Attribute, "", "scormtype", index)));
		}

		public SchemaString Getscormtype()
		{
			return GetscormtypeAt(0);
		}

		public SchemaString scormtype
		{
			get
			{
				return GetscormtypeAt(0);
			}
		}

		public void RemovescormtypeAt(int index)
		{
			RemoveDomChildAt(NodeType.Attribute, "", "scormtype", index);
		}

		public void Removescormtype()
		{
			while (Hasscormtype())
				RemovescormtypeAt(0);
		}

		public void Addscormtype(SchemaString newValue)
		{
			AppendDomChild(NodeType.Attribute, "", "scormtype", newValue.ToString());
		}

		public void InsertscormtypeAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Attribute, "", "scormtype", index, newValue.ToString());
		}

		public void ReplacescormtypeAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Attribute, "", "scormtype", index, newValue.ToString());
		}
		#endregion // scormtype accessor methods
		#region scormtype collection
		public scormtypeCollection	Myscormtypes = new scormtypeCollection( );

		public class scormtypeCollection: IEnumerable
		{
			adlcp_resourceType parent;
			public adlcp_resourceType Parent
			{
				set
				{
					parent = value;
				}
			}
			public scormtypeEnumerator GetEnumerator() 
			{
				return new scormtypeEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class scormtypeEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_resourceType parent;
			public scormtypeEnumerator(adlcp_resourceType par) 
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
				return(nIndex < parent.scormtypeCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GetscormtypeAt(nIndex));
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
	
		#endregion // scormtype collection
		
		protected  override void SetCollectionParents()
		{
			this.Myscormtypes.Parent = this;
			base.SetCollectionParents();
		}
	}
}
