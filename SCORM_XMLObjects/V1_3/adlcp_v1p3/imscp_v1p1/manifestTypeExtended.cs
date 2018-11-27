using System.Collections;
using System.Xml;
using Altova.Types;


namespace imscp_v1p1
{
	/// <summary>
	/// Summary description for manifestTypeExtended.
	/// </summary>
	public class manifestTypeExtended : manifestType
	{
		#region Forward constructors
		public manifestTypeExtended() : base() { SetCollectionParents(); }
		public manifestTypeExtended(XmlDocument doc) : base(doc) { SetCollectionParents(); }
		public manifestTypeExtended(XmlNode node) : base(node) { SetCollectionParents(); }
		public manifestTypeExtended(Altova.Node node) : base(node) { SetCollectionParents(); }
		#endregion // Forward constructors

		public override void AdjustPrefix()
		{
			int nCount;
			
			nCount = DomChildCount(NodeType.Element, "http://www.imsglobal.org/xsd/imsss", "sequencing");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Element, "http://www.imsglobal.org/xsd/imsss", "sequencing", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			base.AdjustPrefix();
		}
		
		#region sequencing accessor methods
		public int GetsequencingMinCount()
		{
			return 1;
		}

		public int sequencingMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetsequencingMaxCount()
		{
			return 1;
		}

		public int sequencingMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetsequencingCount()
		{
			return DomChildCount(NodeType.Element, "", "sequencing");
		}

		public int sequencingCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "", "sequencing");
			}
		}

		public bool Hassequencing()
		{
			return HasDomChild(NodeType.Element, "", "sequencing");
		}

		public SchemaString GetsequencingAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Element, "", "sequencing", index)));
		}

		public SchemaString Getsequencing()
		{
			return GetsequencingAt(0);
		}

		public SchemaString sequencing
		{
			get
			{
				return GetsequencingAt(0);
			}
		}

		public void RemovesequencingAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "", "sequencing", index);
		}

		public void Removesequencing()
		{
			while (Hassequencing())
				RemovesequencingAt(0);
		}

		public void Addsequencing(SchemaString newValue)
		{
			AppendDomChild(NodeType.Element, "", "sequencing", newValue.ToString());
		}

		public void InsertsequencingAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "", "sequencing", index, newValue.ToString());
		}

		public void ReplacesequencingAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "", "sequencing", index, newValue.ToString());
		}
		#endregion // sequencing accessor methods

		#region sequencing collection
		public sequencingCollection	Mysequencings = new sequencingCollection( );

		public class sequencingCollection: IEnumerable
		{
			manifestTypeExtended parent;
			public manifestTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public sequencingEnumerator GetEnumerator() 
			{
				return new sequencingEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class sequencingEnumerator: IEnumerator 
		{
			int nIndex;
			manifestTypeExtended parent;
			public sequencingEnumerator(manifestTypeExtended par) 
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
				return(nIndex < parent.sequencingCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GetsequencingAt(nIndex));
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
	
		#endregion // sequencing collection
		protected override void SetCollectionParents()
		{
			Mysequencings.Parent = this; 
			base.SetCollectionParents();

		}

	}
}
