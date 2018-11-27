using System.Collections;
using System.Xml;
using Altova.Types;


namespace imscp_v1p1
{
	/// <summary>
	/// Summary description for organizationTypeExtended.
	/// </summary>
	public class organizationTypeExtended : organizationType
	{
		#region Forward constructors
		public organizationTypeExtended() : base() { SetCollectionParents(); }
		public organizationTypeExtended(XmlDocument doc) : base(doc) { SetCollectionParents(); }
		public organizationTypeExtended(XmlNode node) : base(node) { SetCollectionParents(); }
		public organizationTypeExtended(Altova.Node node) : base(node) { SetCollectionParents(); }
		#endregion // Forward constructors
		public override void AdjustPrefix()
		{
			int nCount;
			nCount = DomChildCount(NodeType.Attribute, "http://www.adlnet.org/xsd/adlseq_v1p3", "objectivesGlobalToSystem");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Attribute, "http://www.adlnet.org/xsd/adlseq_v1p3", "objectivesGlobalToSystem", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			nCount = DomChildCount(NodeType.Element, "http://www.imsglobal.org/xsd/imsss", "sequencing");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Element, "http://www.imsglobal.org/xsd/imsss", "sequencing", i);
				InternalAdjustPrefix(DOMNode, false);
			}
		}
		#region objectivesGlobalToSystem accessor methods
		public int GetobjectivesGlobalToSystemMinCount()
		{
			return 1;
		}

		public int objectivesGlobalToSystemMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetobjectivesGlobalToSystemMaxCount()
		{
			return 1;
		}

		public int objectivesGlobalToSystemMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetobjectivesGlobalToSystemCount()
		{
			return DomChildCount(NodeType.Element, "", "objectivesGlobalToSystem");
		}

		public int objectivesGlobalToSystemCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "", "objectivesGlobalToSystem");
			}
		}

		public bool HasobjectivesGlobalToSystem()
		{
			return HasDomChild(NodeType.Element, "", "objectivesGlobalToSystem");
		}

		public SchemaString GetobjectivesGlobalToSystemAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Element, "", "objectivesGlobalToSystem", index)));
		}

		public SchemaString GetobjectivesGlobalToSystem()
		{
			return GetobjectivesGlobalToSystemAt(0);
		}

		public SchemaString objectivesGlobalToSystem
		{
			get
			{
				return GetobjectivesGlobalToSystemAt(0);
			}
		}

		public void RemoveobjectivesGlobalToSystemAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "", "objectivesGlobalToSystem", index);
		}

		public void RemoveobjectivesGlobalToSystem()
		{
			while (HasobjectivesGlobalToSystem())
				RemoveobjectivesGlobalToSystemAt(0);
		}

		public void AddobjectivesGlobalToSystem(SchemaString newValue)
		{
			AppendDomChild(NodeType.Element, "", "objectivesGlobalToSystem", newValue.ToString());
		}

		public void InsertobjectivesGlobalToSystemAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "", "objectivesGlobalToSystem", index, newValue.ToString());
		}

		public void ReplaceobjectivesGlobalToSystemAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "", "objectivesGlobalToSystem", index, newValue.ToString());
		}
		#endregion // objectivesGlobalToSystem accessor methods

		#region objectivesGlobalToSystem collection
		public objectivesGlobalToSystemCollection	MyobjectivesGlobalToSystems = new objectivesGlobalToSystemCollection( );

		public class objectivesGlobalToSystemCollection: IEnumerable
		{
			organizationTypeExtended parent;
			public organizationTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public objectivesGlobalToSystemEnumerator GetEnumerator() 
			{
				return new objectivesGlobalToSystemEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class objectivesGlobalToSystemEnumerator: IEnumerator 
		{
			int nIndex;
			organizationTypeExtended parent;
			public objectivesGlobalToSystemEnumerator(organizationTypeExtended par) 
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
				return(nIndex < parent.objectivesGlobalToSystemCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GetobjectivesGlobalToSystemAt(nIndex));
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
	
		#endregion // objectivesGlobalToSystem collection
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

		public imsss_v1p0.sequencingTypeExtended GetsequencingAt(int index)
		{
			return new imsss_v1p0.sequencingTypeExtended(GetDomChildAt(NodeType.Element, "", "sequencing", index));
		}

		public imsss_v1p0.sequencingTypeExtended Getsequencing()
		{
			return  GetsequencingAt(0);
		}

		public imsss_v1p0.sequencingTypeExtended sequencing
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
			organizationTypeExtended parent;
			public organizationTypeExtended Parent
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
			organizationTypeExtended parent;
			public sequencingEnumerator(organizationTypeExtended par) 
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
			public imsss_v1p0.sequencingTypeExtended Current 
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
			MyobjectivesGlobalToSystems.Parent = this; 
			Mysequencings.Parent = this; 
			base.SetCollectionParents();

		}
	}
	
}
