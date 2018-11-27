using System.Collections;
using System.Xml;
using Altova.Types;

namespace imscp_v1p1
{
	/// <summary>
	/// Summary description for resourceTypeExtended.
	/// </summary>
	public class resourceTypeExtended : resourceType
	{
		#region Forward constructors
		public resourceTypeExtended() : base() { SetCollectionParents(); }
		public resourceTypeExtended(XmlDocument doc) : base(doc) { SetCollectionParents(); }
		public resourceTypeExtended(XmlNode node) : base(node) { SetCollectionParents(); }
		public resourceTypeExtended(Altova.Node node) : base(node) { SetCollectionParents(); }
		#endregion // Forward constructors

		public override void AdjustPrefix()
		{
			int nCount;
			
			nCount = DomChildCount(NodeType.Attribute, "http://www.adlnet.org/xsd/adlseq_v1p3", "persistState");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Attribute, "http://www.adlnet.org/xsd/adlseq_v1p3", "persistState", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			nCount = DomChildCount(NodeType.Attribute, "http://www.adlnet.org/xsd/adlseq_v1p3", "scormType");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Attribute, "http://www.adlnet.org/xsd/adlseq_v1p3", "scormType", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			base.AdjustPrefix();
		}
		#region persistState accessor methods
		public int GetpersistStateMinCount()
		{
			return 1;
		}

		public int persistStateMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetpersistStateMaxCount()
		{
			return 1;
		}

		public int persistStateMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetpersistStateCount()
		{
			return DomChildCount(NodeType.Attribute, "", "persistState");
		}

		public int persistStateCount
		{
			get
			{
				return DomChildCount(NodeType.Attribute, "", "persistState");
			}
		}

		public bool HaspersistState()
		{
			return HasDomChild(NodeType.Attribute, "", "persistState");
		}

		public SchemaString GetpersistStateAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Attribute, "", "persistState", index)));
		}

		public SchemaString GetpersistState()
		{
			return GetpersistStateAt(0);
		}

		public SchemaString persistState
		{
			get
			{
				return GetpersistStateAt(0);
			}
		}

		public void RemovepersistStateAt(int index)
		{
			RemoveDomChildAt(NodeType.Attribute, "", "persistState", index);
		}

		public void RemovepersistState()
		{
			while (HaspersistState())
				RemovepersistStateAt(0);
		}

		public void AddpersistState(SchemaString newValue)
		{
			AppendDomChild(NodeType.Attribute, "", "persistState", newValue.ToString());
		}

		public void InsertpersistStateAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Attribute, "", "persistState", index, newValue.ToString());
		}

		public void ReplacepersistStateAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Attribute, "", "persistState", index, newValue.ToString());
		}
		#endregion // persistState accessor methods

		#region persistState collection
		public persistStateCollection	MypersistStates = new persistStateCollection( );

		public class persistStateCollection: IEnumerable
		{
			resourceTypeExtended parent;
			public resourceTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public persistStateEnumerator GetEnumerator() 
			{
				return new persistStateEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class persistStateEnumerator: IEnumerator 
		{
			int nIndex;
			resourceTypeExtended parent;
			public persistStateEnumerator(resourceTypeExtended par) 
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
				return(nIndex < parent.persistStateCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GetpersistStateAt(nIndex));
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
	
		#endregion // persistState collection
        
		#region scormType accessor methods
		public int GetscormTypeMinCount()
		{
			return 1;
		}

		public int scormTypeMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetscormTypeMaxCount()
		{
			return 1;
		}

		public int scormTypeMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetscormTypeCount()
		{
			return DomChildCount(NodeType.Attribute, "", "scormType");
		}

		public int scormTypeCount
		{
			get
			{
				return DomChildCount(NodeType.Attribute, "", "scormType");
			}
		}

		public bool HasscormType()
		{
			return HasDomChild(NodeType.Attribute, "", "scormType");
		}

		public SchemaString GetscormTypeAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Attribute, "", "scormType", index)));
		}

		public SchemaString GetscormType()
		{
			return GetscormTypeAt(0);
		}

		public SchemaString scormType
		{
			get
			{
				return GetscormTypeAt(0);
			}
		}

		public void RemovescormTypeAt(int index)
		{
			RemoveDomChildAt(NodeType.Attribute, "", "scormType", index);
		}

		public void RemovescormType()
		{
			while (HasscormType())
				RemovescormTypeAt(0);
		}

		public void AddscormType(SchemaString newValue)
		{
			AppendDomChild(NodeType.Attribute, "", "scormType", newValue.ToString());
		}

		public void InsertscormTypeAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Attribute, "", "scormType", index, newValue.ToString());
		}

		public void ReplacescormTypeAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Attribute, "", "scormType", index, newValue.ToString());
		}
		#endregion // scormType accessor methods

		#region scormType collection
		public scormTypeCollection	MyscormTypes = new scormTypeCollection( );

		public class scormTypeCollection: IEnumerable
		{
			resourceTypeExtended parent;
			public resourceTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public scormTypeEnumerator GetEnumerator() 
			{
				return new scormTypeEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class scormTypeEnumerator: IEnumerator 
		{
			int nIndex;
			resourceTypeExtended parent;
			public scormTypeEnumerator(resourceTypeExtended par) 
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
				return(nIndex < parent.scormTypeCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GetscormTypeAt(nIndex));
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
	
		#endregion // scormType collection
              


		protected override void SetCollectionParents()
		{
			MypersistStates.Parent = this; 
			MyscormTypes.Parent = this; 
			base.SetCollectionParents();
		}
	
	}
}
