using System;
using System.Collections;
using System.Xml;
using Altova.Types;

namespace adlcp_rootv1p2
{
	/// <summary>
	/// Inherits from the imscp_itemType class in order to add the SCORM additions to ItemType
	/// Adds adlcp types to the ims types for itemType
	/// </summary>
	public class adlcp_itemType : imscp.itemType
	{
		#region Forward constructors
		public adlcp_itemType() : base() { SetCollectionParents(); }
		public adlcp_itemType(XmlDocument doc) : base(doc) { SetCollectionParents(); }
		public adlcp_itemType(XmlNode node) : base(node) { SetCollectionParents(); }
		public adlcp_itemType(Altova.Node node) : base(node) { SetCollectionParents(); }
		#endregion // Forward constructors
		#region prerequisites accessor methods
		public int GetprerequisitesMinCount()
		{
			return 0;
		}

		public int prerequisitesMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetprerequisitesMaxCount()
		{
			return 1;
		}

		public int prerequisitesMaxCount
		{
			get
			{
				return 1;
			}
		}
		public int GetprerequisitesCount()
		{
			return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites");
		}

		public int prerequisitesCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites");
			}
		}

		public bool Hasprerequisites()
		{
			return HasDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites");
		}

		public prerequisitesType GetprerequisitesAt(int index)
		{
			return new prerequisitesType(GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites", index));
		}

		public prerequisitesType Getprerequisites()
		{
			return GetprerequisitesAt(0);
		}

		public prerequisitesType prerequisites
		{
			get
			{
				return GetprerequisitesAt(0);
			}
		}

		public void RemoveprerequisitesAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites", index);
		}

		public void Removeprerequisites()
		{
			while (Hasprerequisites())
				RemoveprerequisitesAt(0);
		}

		public void Addprerequisites(prerequisitesType newValue)
		{
			AppendDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites", newValue.ToString());
		}

		public void InsertprerequisitesAt(prerequisitesType newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites", index, newValue.ToString());
		}

		public void ReplaceprerequisitesAt(prerequisitesType newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "prerequisites", index, newValue.ToString());
		}
		#endregion // prerequisites accessor methods

		#region prerequisites collection
		public prerequisitesCollection	Myprerequisites = new prerequisitesCollection( );

		public class prerequisitesCollection: IEnumerable
		{
			adlcp_itemType parent;
			public adlcp_itemType Parent
			{
				set
				{
					parent = value;
				}
			}
			public prerequisitesEnumerator GetEnumerator() 
			{
				return new prerequisitesEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class prerequisitesEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_itemType parent;
			public prerequisitesEnumerator(adlcp_itemType par) 
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
				return(nIndex < parent.prerequisitesCount );
				
				
			}
			public prerequisitesType  Current 
			{
				get 
				{
					return(parent.GetprerequisitesAt(nIndex));
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
	
		#endregion // prerequisites collection
		#region maxtimeallowed accessor methods
		public int GetmaxtimeallowedMinCount()
		{
			return 0;
		}

		public int maxtimeallowedMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetmaxtimeallowedMaxCount()
		{
			return 1;
		}

		public int maxtimeallowedMaxCount
		{
			get
			{
				return 1;
			}
		}
		public int GetmaxtimeallowedCount()
		{
			return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed");
		}

		public int maxtimeallowedCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed");
			}
		}

		public bool Hasmaxtimeallowed()
		{
			return HasDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed");
		}

		public maxtimeallowedType GetmaxtimeallowedAt(int index)
		{
			return new maxtimeallowedType(GetDomNodeValue(GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed",index)));
		}

		public maxtimeallowedType Getmaxtimeallowed()
		{
			return GetmaxtimeallowedAt(0);
		}

		public maxtimeallowedType maxtimeallowed
		{
			get
			{
				return GetmaxtimeallowedAt(0);
			}
		}

		public void RemovemaxtimeallowedAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed", index);
		}

		public void Removemaxtimeallowed()
		{
			while (Hasmaxtimeallowed())
				RemovemaxtimeallowedAt(0);
		}

		public void Addmaxtimeallowed(maxtimeallowedType newValue)
		{
			AppendDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed", newValue.ToString());
		}

		public void InsertmaxtimeallowedAt(maxtimeallowedType newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed", index, newValue.ToString());
		}

		public void ReplacemaxtimeallowedAt(maxtimeallowedType newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "maxtimeallowed", index, newValue.ToString());
		}
		#endregion // maxtimeallowed accessor methods

		#region maxtimeallowed collection
		public maxtimeallowedCollection	Mymaxtimeallowed = new maxtimeallowedCollection( );

		public class maxtimeallowedCollection: IEnumerable
		{
			adlcp_itemType parent;
			public adlcp_itemType Parent
			{
				set
				{
					parent = value;
				}
			}
			public maxtimeallowedEnumerator GetEnumerator() 
			{
				return new maxtimeallowedEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class maxtimeallowedEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_itemType parent;
			public maxtimeallowedEnumerator(adlcp_itemType par) 
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
				return(nIndex < parent.maxtimeallowedCount );
				
				
			}
			public maxtimeallowedType  Current 
			{
				get 
				{
					return(parent.GetmaxtimeallowedAt(nIndex));
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
	
		#endregion // maxtimeallowed collection
		#region timelimitaction accessor methods
		public int GettimelimitactionMinCount()
		{
			return 0;
		}

		public int timelimitactionMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GettimelimitactionMaxCount()
		{
			return 1;
		}

		public int timelimitactionMaxCount
		{
			get
			{
				return 1;
			}
		}
		public int GettimelimitactionCount()
		{
			return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction");
		}

		public int timelimitactionCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction");
			}
		}

		public bool Hastimelimitaction()
		{
			return HasDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction");
		}

		public timelimitactionType GettimelimitactionAt(int index)
		{
			return new timelimitactionType(GetDomNodeValue(GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction", index)));
		}

		public timelimitactionType Gettimelimitaction()
		{
			return GettimelimitactionAt(0);
		}

		public timelimitactionType timelimitaction
		{
			get
			{
				return GettimelimitactionAt(0);
			}
		}

		public void RemovetimelimitactionAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction", index);
		}

		public void Removetimelimitaction()
		{
			while (Hastimelimitaction())
				RemovetimelimitactionAt(0);
		}

		public void Addtimelimitaction(timelimitactionType newValue)
		{
			AppendDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction", newValue.ToString());
		}

		public void InserttimelimitactionAt(timelimitactionType newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction", index, newValue.ToString());
		}

		public void ReplacetimelimitactionAt(timelimitactionType newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "timelimitaction", index, newValue.ToString());
		}
		#endregion // timelimitaction accessor methods

		#region timelimitaction collection
		public timelimitactionCollection	Mytimelimitaction = new timelimitactionCollection( );

		public class timelimitactionCollection: IEnumerable
		{
			adlcp_itemType parent;
			public adlcp_itemType Parent
			{
				set
				{
					parent = value;
				}
			}
			public timelimitactionEnumerator GetEnumerator() 
			{
				return new timelimitactionEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class timelimitactionEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_itemType parent;
			public timelimitactionEnumerator(adlcp_itemType par) 
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
				return(nIndex < parent.timelimitactionCount );
				
				
			}
			public timelimitactionType  Current 
			{
				get 
				{
					return(parent.GettimelimitactionAt(nIndex));
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
	
		#endregion // timelimitaction collection
		#region datafromlms accessor methods
		public int GetdatafromlmsMinCount()
		{
			return 0;
		}

		public int datafromlmsMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetdatafromlmsMaxCount()
		{
			return 1;
		}

		public int datafromlmsMaxCount
		{
			get
			{
				return 1;
			}
		}
		public int GetdatafromlmsCount()
		{
			return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms");
		}

		public int datafromlmsCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms");
			}
		}

		public bool Hasdatafromlms()
		{
			return HasDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms");
		}

		public datafromlmsType GetdatafromlmsAt(int index)
		{
			return new datafromlmsType(GetDomNodeValue(GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms", index)));
		}

		public datafromlmsType Getdatafromlms()
		{
			return GetdatafromlmsAt(0);
		}

		public datafromlmsType datafromlms
		{
			get
			{
				return GetdatafromlmsAt(0);
			}
		}

		public void RemovedatafromlmsAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms", index);
		}

		public void Removedatafromlms()
		{
			while (Hasdatafromlms())
				RemovedatafromlmsAt(0);
		}

		public void Adddatafromlms(datafromlmsType newValue)
		{
			AppendDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms", newValue.ToString());
		}

		public void InsertdatafromlmsAt(datafromlmsType newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms", index, newValue.ToString());
		}

		public void ReplacedatafromlmsAt(datafromlmsType newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "datafromlms", index, newValue.ToString());
		}
		#endregion // datafromlms accessor methods

		#region datafromlms collection
		public datafromlmsCollection	Mydatafromlms = new datafromlmsCollection( );

		public class datafromlmsCollection: IEnumerable
		{
			adlcp_itemType parent;
			public adlcp_itemType Parent
			{
				set
				{
					parent = value;
				}
			}
			public datafromlmsEnumerator GetEnumerator() 
			{
				return new datafromlmsEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class datafromlmsEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_itemType parent;
			public datafromlmsEnumerator(adlcp_itemType par) 
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
				return(nIndex < parent.datafromlmsCount );
				
				
			}
			public datafromlmsType  Current 
			{
				get 
				{
					return(parent.GetdatafromlmsAt(nIndex));
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
	
		#endregion // datafromlms collection
		#region masteryscore accessor methods
		public int GetmasteryscoreMinCount()
		{
			return 0;
		}

		public int masteryscoreMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetmasteryscoreMaxCount()
		{
			return 1;
		}

		public int masteryscoreMaxCount
		{
			get
			{
				return 1;
			}
		}
		public int GetmasteryscoreCount()
		{
			return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore");
		}

		public int masteryscoreCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore");
			}
		}

		public bool Hasmasteryscore()
		{
			return HasDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore");
		}

		public masteryscoreType GetmasteryscoreAt(int index)
		{
			return new masteryscoreType(GetDomNodeValue(GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore",index)));
		}

		public masteryscoreType Getmasteryscore()
		{
			return GetmasteryscoreAt(0);
		}

		public masteryscoreType masteryscore
		{
			get
			{
				return GetmasteryscoreAt(0);
			}
		}

		public void RemovemasteryscoreAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore", index);
		}

		public void Removemasteryscore()
		{
			while (Hasmasteryscore())
				RemovemasteryscoreAt(0);
		}

		public void Addmasteryscore(masteryscoreType newValue)
		{
			AppendDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore", newValue.ToString());
		}

		public void InsertmasteryscoreAt(masteryscoreType newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore", index, newValue.ToString());
		}

		public void ReplacemasteryscoreAt(masteryscoreType newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "masteryscore", index, newValue.ToString());
		}
		#endregion // masteryscore accessor methods

		#region masteryscore collection
		public masteryscoreCollection	Mymasteryscore = new masteryscoreCollection( );

		public class masteryscoreCollection: IEnumerable
		{
			adlcp_itemType parent;
			public adlcp_itemType Parent
			{
				set
				{
					parent = value;
				}
			}
			public masteryscoreEnumerator GetEnumerator() 
			{
				return new masteryscoreEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class masteryscoreEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_itemType parent;
			public masteryscoreEnumerator(adlcp_itemType par) 
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
				return(nIndex < parent.masteryscoreCount );
				
				
			}
			public masteryscoreType  Current 
			{
				get 
				{
					return(parent.GetmasteryscoreAt(nIndex));
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
	
		#endregion // masteryscore collection
		#region item accessor methods
		public int GetitemMinCount()
		{
			return 0;
		}

		public int itemMinCount
		{
			get
			{
				return 0;
			}
		}

		public int GetitemMaxCount()
		{
			return Int32.MaxValue;
		}

		public int itemMaxCount
		{
			get
			{
				return Int32.MaxValue;
			}
		}

		public int GetitemCount()
		{
			return DomChildCount(NodeType.Element, "http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item");
		}

		public int itemCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item");
			}
		}

		public bool Hasitem()
		{
			return HasDomChild(NodeType.Element, "http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item");
		}

		public adlcp_itemType GetitemAt(int index)
		{
			return new adlcp_itemType(GetDomChildAt(NodeType.Element, "http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item", index));
		}

		public adlcp_itemType Getitem()
		{
			return GetitemAt(0);
		}

		public adlcp_itemType item
		{
			get
			{
				return GetitemAt(0);
			}
		}

		public void RemoveitemAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item", index);
		}

		public void Removeitem()
		{
			while (Hasitem())
				RemoveitemAt(0);
		}

		public void Additem(adlcp_itemType newValue)
		{
			AppendDomElement("http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item", newValue);
		}

		public void InsertitemAt(adlcp_itemType newValue, int index)
		{
			InsertDomElementAt("http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item", index, newValue);
		}

		public void ReplaceitemAt(adlcp_itemType newValue, int index)
		{
			ReplaceDomElementAt("http://www.imsproject.org/xsd/imscp_rootv1p1p2", "item", index, newValue);
		}
		#endregion // item accessor methods

		#region item collection
		public itemCollection	Myitems = new itemCollection( );

		public class itemCollection: IEnumerable
		{
			adlcp_itemType parent;
			public adlcp_itemType Parent
			{
				set
				{
					parent = value;
				}
			}
			public itemEnumerator GetEnumerator() 
			{
				return new itemEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class itemEnumerator: IEnumerator 
		{
			int nIndex;
			adlcp_itemType parent;
			public itemEnumerator(adlcp_itemType par) 
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
				return(nIndex < parent.itemCount );
			}
			public adlcp_itemType  Current 
			{
				get 
				{
					return(parent.GetitemAt(nIndex));
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
	
		#endregion // item collection
		protected  override void SetCollectionParents()
		{
			Myprerequisites.Parent = this; 
			Mymaxtimeallowed.Parent = this;
			Mytimelimitaction.Parent = this;
			Mydatafromlms.Parent = this;
			Mymasteryscore.Parent = this;
			Myitems.Parent = this; 
			base.SetCollectionParents();
		}
		
	}
}
