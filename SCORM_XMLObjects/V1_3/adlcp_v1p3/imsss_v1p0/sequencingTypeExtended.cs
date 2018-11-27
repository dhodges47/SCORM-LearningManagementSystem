using System.Collections;
using System.Xml;

namespace imsss_v1p0
{
	/// <summary>
	/// Summary description for sequencingTypeExtended.
	/// </summary>
	public class sequencingTypeExtended : sequencingType
	{
		#region Forward constructors
		public sequencingTypeExtended() : base() { SetCollectionParents(); }
		public sequencingTypeExtended(XmlDocument doc) : base(doc) { SetCollectionParents(); }
		public sequencingTypeExtended(XmlNode node) : base(node) { SetCollectionParents(); }
		public sequencingTypeExtended(Altova.Node node) : base(node) { SetCollectionParents(); }
		#endregion // Forward constructors

	

		#region rollupConsiderations accessor methods
		public int GetrollupConsiderationsMinCount()
		{
			return 0;
		}

		public int rollupConsiderationsMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetrollupConsiderationsMaxCount()
		{
			return 1;
		}

		public int rollupConsiderationsMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetrollupConsiderationsCount()
		{
			return DomChildCount(NodeType.Attribute, "", "rollupConsiderations");
		}

		public int rollupConsiderationsCount
		{
			get
			{
				return DomChildCount(NodeType.Attribute, "", "rollupConsiderations");
			}
		}

		public bool HasrollupConsiderations()
		{
			return HasDomChild(NodeType.Attribute, "", "rollupConsiderations");
		}

		public adlseq_v1p3.rollupConsiderationsType GetrollupConsiderationsAt(int index)
		{
			return new adlseq_v1p3.rollupConsiderationsType(GetDomChildAt(NodeType.Element, "", "rollupConsiderations", index));
		}

		public adlseq_v1p3.rollupConsiderationsType GetrollupConsiderations()
		{
			return GetrollupConsiderationsAt(0);
		}

		public adlseq_v1p3.rollupConsiderationsType rollupConsiderations
		{
			get
			{
				return GetrollupConsiderationsAt(0);
			}
		}

	
		#endregion // rollupConsiderations accessor methods

		#region rollupConsiderations collection
		public rollupConsiderationsCollection	MyrollupConsiderationss = new rollupConsiderationsCollection( );

		public class rollupConsiderationsCollection: IEnumerable
		{
			sequencingTypeExtended parent;
			public sequencingTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public rollupConsiderationsEnumerator GetEnumerator() 
			{
				return new rollupConsiderationsEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class rollupConsiderationsEnumerator: IEnumerator 
		{
			int nIndex;
			sequencingTypeExtended parent;
			public rollupConsiderationsEnumerator(sequencingTypeExtended par) 
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
				return(nIndex < parent.rollupConsiderationsCount );
			}
			public adlseq_v1p3.rollupConsiderationsType Current 
			{
				get 
				{
					return(parent.GetrollupConsiderationsAt(nIndex));
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
	
		#endregion // rollupConsiderations collection

		#region constrainedChoiceConsiderations accessor methods
		public int GetconstrainedChoiceConsiderationsMinCount()
		{
			return 0;
		}

		public int constrainedChoiceConsiderationsMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetconstrainedChoiceConsiderationsMaxCount()
		{
			return 1;
		}

		public int constrainedChoiceConsiderationsMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetconstrainedChoiceConsiderationsCount()
		{
			return DomChildCount(NodeType.Attribute, "", "constrainedChoiceConsiderations");
		}

		public int constrainedChoiceConsiderationsCount
		{
			get
			{
				return DomChildCount(NodeType.Attribute, "", "constrainedChoiceConsiderations");
			}
		}

		public bool HasconstrainedChoiceConsiderations()
		{
			return HasDomChild(NodeType.Attribute, "", "constrainedChoiceConsiderations");
		}

		public adlseq_v1p3.constrainChoiceConsiderationsType GetconstrainedChoiceConsiderationsAt(int index)
		{
			return new adlseq_v1p3.constrainChoiceConsiderationsType(GetDomChildAt(NodeType.Element, "", "constrainedChoiceConsiderations", index));
		}

		public adlseq_v1p3.constrainChoiceConsiderationsType GetconstrainedChoiceConsiderations()
		{
			return GetconstrainedChoiceConsiderationsAt(0);
		}

		public adlseq_v1p3.constrainChoiceConsiderationsType constrainedChoiceConsiderations
		{
			get
			{
				return GetconstrainedChoiceConsiderationsAt(0);
			}
		}

	
		#endregion // constrainedChoiceConsiderations accessor methods

		#region constrainedChoiceConsiderations collection
		public constrainedChoiceConsiderationsCollection	MyconstrainedChoiceConsiderationss = new constrainedChoiceConsiderationsCollection( );

		public class constrainedChoiceConsiderationsCollection: IEnumerable
		{
			sequencingTypeExtended parent;
			public sequencingTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public constrainedChoiceConsiderationsEnumerator GetEnumerator() 
			{
				return new constrainedChoiceConsiderationsEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class constrainedChoiceConsiderationsEnumerator: IEnumerator 
		{
			int nIndex;
			sequencingTypeExtended parent;
			public constrainedChoiceConsiderationsEnumerator(sequencingTypeExtended par) 
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
				return(nIndex < parent.constrainedChoiceConsiderationsCount );
			}
			public adlseq_v1p3.constrainChoiceConsiderationsType Current 
			{
				get 
				{
					return(parent.GetconstrainedChoiceConsiderationsAt(nIndex));
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
	
		#endregion // constrainedChoiceConsiderations collection


		public override void SetCollectionParents()
		{
			MyrollupConsiderationss.Parent = this; 
			MyconstrainedChoiceConsiderationss.Parent = this; 
			base.SetCollectionParents();
		}
	}
}
