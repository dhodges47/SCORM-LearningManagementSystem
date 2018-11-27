using System;
using System.Collections;
using System.Xml;
using Altova.Types;

namespace imscp_v1p1
{
	/// <summary>
	/// Adds ADL extensions to ItemType Class 
	/// Done manually by David Hodges, Outermost Software, 5/3/2005 
	/// </summary>
	public class itemTypeExtended : itemType
	{

		#region Forward constructors
		public itemTypeExtended() : base() { SetCollectionParents(); }
		public itemTypeExtended(XmlDocument doc) : base(doc) { SetCollectionParents(); }
		public itemTypeExtended(XmlNode node) : base(node) { SetCollectionParents(); }
		public itemTypeExtended(Altova.Node node) : base(node) { SetCollectionParents(); }
		#endregion // Forward constructors

		public override void AdjustPrefix()
		{
			int nCount;

			nCount = DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_v1p3", "timeLimitAction");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_v1p3", "timeLimitAction", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			
			nCount = DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_v1p3", "dataFromLMS");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_v1p3", "dataFromLMS", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			
			nCount = DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_v1p3", "completionThreshold");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_v1p3", "completionThreshold", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			
			nCount = DomChildCount(NodeType.Element, "http://www.imsglobal.org/xsd/imsss", "sequencing");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Element, "http://www.imsglobal.org/xsd/imsss", "sequencing", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			
			nCount = DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlnav_v1p3", "presentation");
			for (int i = 0; i < nCount; i++)
			{
				XmlNode DOMNode = GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlnav_v1p3", "presentation", i);
				InternalAdjustPrefix(DOMNode, false);
			}
			base.AdjustPrefix();
		}
		#region timeLimitAction accessor methods
		public int GettimeLimitActionMinCount()
		{
			return 1;
		}

		public int timeLimitActionMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GettimeLimitActionMaxCount()
		{
			return 1;
		}

		public int timeLimitActionMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GettimeLimitActionCount()
		{
			return DomChildCount(NodeType.Element, "", "timeLimitAction");
		}

		public int timeLimitActionCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "", "timeLimitAction");
			}
		}

		public bool HastimeLimitAction()
		{
			return HasDomChild(NodeType.Element, "", "timeLimitAction");
		}

		public SchemaString GettimeLimitActionAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Element, "", "timeLimitAction", index)));
		}

		public SchemaString GettimeLimitAction()
		{
			return GettimeLimitActionAt(0);
		}

		public SchemaString timeLimitAction
		{
			get
			{
				return GettimeLimitActionAt(0);
			}
		}

		public void RemovetimeLimitActionAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "", "timeLimitAction", index);
		}

		public void RemovetimeLimitAction()
		{
			while (HastimeLimitAction())
				RemovetimeLimitActionAt(0);
		}

		public void AddtimeLimitAction(SchemaString newValue)
		{
			AppendDomChild(NodeType.Element, "", "timeLimitAction", newValue.ToString());
		}

		public void InserttimeLimitActionAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "", "timeLimitAction", index, newValue.ToString());
		}

		public void ReplacetimeLimitActionAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "", "timeLimitAction", index, newValue.ToString());
		}
		#endregion // timeLimitAction accessor methods

		#region timeLimitAction collection
		public timeLimitActionCollection	MytimeLimitActions = new timeLimitActionCollection( );

		public class timeLimitActionCollection: IEnumerable
		{
			itemTypeExtended parent;
			public itemTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public timeLimitActionEnumerator GetEnumerator() 
			{
				return new timeLimitActionEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class timeLimitActionEnumerator: IEnumerator 
		{
			int nIndex;
			itemTypeExtended parent;
			public timeLimitActionEnumerator(itemTypeExtended par) 
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
				return(nIndex < parent.timeLimitActionCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GettimeLimitActionAt(nIndex));
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
	
		#endregion // timeLimitAction collection

		#region dataFromLMS accessor methods
		public int GetdataFromLMSMinCount()
		{
			return 1;
		}

		public int dataFromLMSMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetdataFromLMSMaxCount()
		{
			return 1;
		}

		public int dataFromLMSMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetdataFromLMSCount()
		{
			return DomChildCount(NodeType.Element, "", "dataFromLMS");
		}

		public int dataFromLMSCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "", "dataFromLMS");
			}
		}

		public bool HasdataFromLMS()
		{
			return HasDomChild(NodeType.Element, "", "dataFromLMS");
		}

		public SchemaString GetdataFromLMSAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Element, "", "dataFromLMS", index)));
		}

		public SchemaString GetdataFromLMS()
		{
			return GetdataFromLMSAt(0);
		}

		public SchemaString dataFromLMS
		{
			get
			{
				return GetdataFromLMSAt(0);
			}
		}

		public void RemovedataFromLMSAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "", "dataFromLMS", index);
		}

		public void RemovedataFromLMS()
		{
			while (HasdataFromLMS())
				RemovedataFromLMSAt(0);
		}

		public void AdddataFromLMS(SchemaString newValue)
		{
			AppendDomChild(NodeType.Element, "", "dataFromLMS", newValue.ToString());
		}

		public void InsertdataFromLMSAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "", "dataFromLMS", index, newValue.ToString());
		}

		public void ReplacedataFromLMSAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "", "dataFromLMS", index, newValue.ToString());
		}
		#endregion // dataFromLMS accessor methods

		#region dataFromLMS collection
		public dataFromLMSCollection	MydataFromLMSs = new dataFromLMSCollection( );

		public class dataFromLMSCollection: IEnumerable
		{
			itemTypeExtended parent;
			public itemTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public dataFromLMSEnumerator GetEnumerator() 
			{
				return new dataFromLMSEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class dataFromLMSEnumerator: IEnumerator 
		{
			int nIndex;
			itemTypeExtended parent;
			public dataFromLMSEnumerator(itemTypeExtended par) 
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
				return(nIndex < parent.dataFromLMSCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GetdataFromLMSAt(nIndex));
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
	
		#endregion // dataFromLMS collection
   		
		#region completionThreshold accessor methods
		public int GetcompletionThresholdMinCount()
		{
			return 1;
		}

		public int completionThresholdMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetcompletionThresholdMaxCount()
		{
			return 1;
		}

		public int completionThresholdMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetcompletionThresholdCount()
		{
			return DomChildCount(NodeType.Element, "", "completionThreshold");
		}

		public int completionThresholdCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "", "completionThreshold");
			}
		}

		public bool HascompletionThreshold()
		{
			return HasDomChild(NodeType.Element, "", "completionThreshold");
		}

		public SchemaString GetcompletionThresholdAt(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Element, "", "completionThreshold", index)));
		}

		public SchemaString GetcompletionThreshold()
		{
			return GetcompletionThresholdAt(0);
		}

		public SchemaString completionThreshold
		{
			get
			{
				return GetcompletionThresholdAt(0);
			}
		}

		public void RemovecompletionThresholdAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "", "completionThreshold", index);
		}

		public void RemovecompletionThreshold()
		{
			while (HascompletionThreshold())
				RemovecompletionThresholdAt(0);
		}

		public void AddcompletionThreshold(SchemaString newValue)
		{
			AppendDomChild(NodeType.Element, "", "completionThreshold", newValue.ToString());
		}

		public void InsertcompletionThresholdAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "", "completionThreshold", index, newValue.ToString());
		}

		public void ReplacecompletionThresholdAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "", "completionThreshold", index, newValue.ToString());
		}
		#endregion // completionThreshold accessor methods

		#region completionThreshold collection
		public completionThresholdCollection	MycompletionThresholds = new completionThresholdCollection( );

		public class completionThresholdCollection: IEnumerable
		{
			itemTypeExtended parent;
			public itemTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public completionThresholdEnumerator GetEnumerator() 
			{
				return new completionThresholdEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class completionThresholdEnumerator: IEnumerator 
		{
			int nIndex;
			itemTypeExtended parent;
			public completionThresholdEnumerator(itemTypeExtended par) 
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
				return(nIndex < parent.completionThresholdCount );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.GetcompletionThresholdAt(nIndex));
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
	
		#endregion // completionThreshold collection
        

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
			return GetsequencingAt(0);
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
			itemTypeExtended parent;
			public itemTypeExtended Parent
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
			itemTypeExtended parent;
			public sequencingEnumerator(itemTypeExtended par) 
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
			public imsss_v1p0.sequencingTypeExtended  Current 
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

		#region presentation accessor methods
		public int GetpresentationMinCount()
		{
			return 1;
		}

		public int presentationMinCount
		{
			get
			{
				return 1;
			}
		}

		public int GetpresentationMaxCount()
		{
			return 1;
		}

		public int presentationMaxCount
		{
			get
			{
				return 1;
			}
		}

		public int GetpresentationCount()
		{
			return DomChildCount(NodeType.Element, "", "presentation");
		}

		public int presentationCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "", "presentation");
			}
		}

		public bool Haspresentation()
		{
			return HasDomChild(NodeType.Element, "", "presentation");
		}

		public adlnav_v1p3.presentationType GetpresentationAt(int index)
		{
			return new adlnav_v1p3.presentationType(GetDomChildAt(NodeType.Element, "", "presentation", index));
		}

		public adlnav_v1p3.presentationType Getpresentation()
		{
			return GetpresentationAt(0);
		}

		public adlnav_v1p3.presentationType presentation
		{
			get
			{
				return GetpresentationAt(0);
			}
		}

		public void RemovepresentationAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "", "presentation", index);
		}

		public void Removepresentation()
		{
			while (Haspresentation())
				RemovepresentationAt(0);
		}

		public void Addpresentation(SchemaString newValue)
		{
			AppendDomChild(NodeType.Element, "", "presentation", newValue.ToString());
		}

		public void InsertpresentationAt(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "", "presentation", index, newValue.ToString());
		}

		public void ReplacepresentationAt(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "", "presentation", index, newValue.ToString());
		}
		#endregion // presentation accessor methods

		#region presentation collection
		public presentationCollection	Mypresentations = new presentationCollection( );

		public class presentationCollection: IEnumerable
		{
			itemTypeExtended parent;
			public itemTypeExtended Parent
			{
				set
				{
					parent = value;
				}
			}
			public presentationEnumerator GetEnumerator() 
			{
				return new presentationEnumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
		}

		public class presentationEnumerator: IEnumerator 
		{
			int nIndex;
			itemTypeExtended parent;
			public presentationEnumerator(itemTypeExtended par) 
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
				return(nIndex < parent.presentationCount );
			}
			public adlnav_v1p3.presentationType  Current 
			{
				get 
				{
					return(parent.GetpresentationAt(nIndex));
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
	
		#endregion // presentation collection
        
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
			return DomChildCount(NodeType.Element, "http://www.imsglobal.org/xsd/imscp_v1p1", "item");
		}

		public int itemCount
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.imsglobal.org/xsd/imscp_v1p1", "item");
			}
		}

		public bool Hasitem()
		{
			return HasDomChild(NodeType.Element, "http://www.imsglobal.org/xsd/imscp_v1p1", "item");
		}

		public itemTypeExtended GetitemAt(int index)
		{
			return new itemTypeExtended(GetDomChildAt(NodeType.Element, "http://www.imsglobal.org/xsd/imscp_v1p1", "item", index));
		}

		public itemTypeExtended Getitem()
		{
			return GetitemAt(0);
		}

		public itemTypeExtended item
		{
			get
			{
				return GetitemAt(0);
			}
		}

		public void RemoveitemAt(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.imsglobal.org/xsd/imscp_v1p1", "item", index);
		}

		public void Removeitem()
		{
			while (Hasitem())
				RemoveitemAt(0);
		}

		public void Additem(itemTypeExtended newValue)
		{
			AppendDomElement("http://www.imsglobal.org/xsd/imscp_v1p1", "item", newValue);
		}

		public void InsertitemAt(itemTypeExtended newValue, int index)
		{
			InsertDomElementAt("http://www.imsglobal.org/xsd/imscp_v1p1", "item", index, newValue);
		}

		public void ReplaceitemAt(itemTypeExtended newValue, int index)
		{
			ReplaceDomElementAt("http://www.imsglobal.org/xsd/imscp_v1p1", "item", index, newValue);
		}
		#endregion // item accessor methods

		#region item collection
		public itemCollection	Myitems = new itemCollection( );

		public class itemCollection: IEnumerable
		{
			itemTypeExtended parent;
			public itemTypeExtended Parent
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
			itemTypeExtended parent;
			public itemEnumerator(itemTypeExtended par) 
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
			public itemTypeExtended  Current 
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

		
		protected override void SetCollectionParents()
		{
			MytimeLimitActions.Parent = this; 
			MydataFromLMSs.Parent = this;
			MycompletionThresholds.Parent = this; 
			Mysequencings.Parent = this; 
			Mypresentations.Parent = this; 
			Myitems.Parent = this; 
			base.SetCollectionParents();

		}
	} // end class
} // end NameSpace
