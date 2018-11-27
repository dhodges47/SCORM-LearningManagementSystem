// template for adding adlcp extensions to a generated method
// search and replace the word "#element#" with the name of the adlcp node you want to add to the generated class.
==================================================================================================================================
use this section if you are adding an element
==================================================================================================================================

		#region #element# accessor methods
		public int Get#element#MinCount()
		{
			return 0;
		}

		public int #element#MinCount
		{
			get
			{
				return 0;
			}
		}

		public int Get#element#MaxCount()
		{
			return 1;
		}

		public int #element#MaxCount
		{
			get
			{
				return 1;
			}
		}
		public int Get#element#Count()
		{
			return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#");
		}

		public int #element#Count
		{
			get
			{
				return DomChildCount(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#");
			}
		}

		public bool Has#element#()
		{
			return HasDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#");
		}

		public #element#Type Get#element#At(int index)
		{
			return new #element#Type(GetDomNodeValue(GetDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#", index)));
		}

		public #element#Type Get#element#()
		{
			return Get#element#At(0);
		}

		public #element#Type #element#
		{
			get
			{
				return Get#element#At(0);
			}
		}

		public void Remove#element#At(int index)
		{
			RemoveDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#", index);
		}

		public void Remove#element#()
		{
			while (Has#element#())
				Remove#element#At(0);
		}

		public void Add#element#(#element#Type newValue)
		{
			AppendDomChild(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#", newValue.ToString());
		}

		public void Insert#element#At(#element#Type newValue, int index)
		{
			InsertDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#", index, newValue.ToString());
		}

		public void Replace#element#At(#element#Type newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Element, "http://www.adlnet.org/xsd/adlcp_rootv1p2", "#element#", index, newValue.ToString());
		}
		#endregion // #element# accessor methods

		#region #element# collection
        public #element#Collection	My#element#s = new #element#Collection( );

        public class #element#Collection: IEnumerable
        {
            metadataType parent;
            public metadataType Parent
			{
				set
				{
					parent = value;
				}
			}
			public #element#Enumerator GetEnumerator() 
			{
				return new #element#Enumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
        }

        public class #element#Enumerator: IEnumerator 
        {
			int nIndex;
			metadataType parent;
			public #element#Enumerator(metadataType par) 
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
				return(nIndex < parent.#element#Count );
			}
			public #element#Type  Current 
			{
				get 
				{
					return(parent.Get#element#At(nIndex));
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
	
        #endregion // #element# collection

==================================================================================================================================
use this section if you are adding an attribute
==================================================================================================================================
		#region #attribute# accessor methods
		public int Get#attribute#MinCount()
		{
			return 1;
		}

		public int #attribute#MinCount
		{
			get
			{
				return 1;
			}
		}

		public int Get#attribute#MaxCount()
		{
			return 1;
		}

		public int #attribute#MaxCount
		{
			get
			{
				return 1;
			}
		}

		public int Get#attribute#Count()
		{
			return DomChildCount(NodeType.Attribute, "", "#attribute#");
		}


		public int #attribute#Count
		{
			get
			{
				return DomChildCount(NodeType.Attribute, "", "#attribute#");
			}
		}

		public bool Has#attribute#()
		{
			return HasDomChild(NodeType.Attribute, "", "#attribute#");
		}

		public SchemaString Get#attribute#At(int index)
		{
			return new SchemaString(GetDomNodeValue(GetDomChildAt(NodeType.Attribute, "", "#attribute#", index)));
		}

		public SchemaString Get#attribute#()
		{
			return Get#attribute#At(0);
		}

		public SchemaString #attribute#
		{
			get
			{
				return Get#attribute#At(0);
			}
		}

		public void Remove#attribute#At(int index)
		{
			RemoveDomChildAt(NodeType.Attribute, "", "#attribute#", index);
		}

		public void Remove#attribute#()
		{
			while (Has#attribute#())
				Remove#attribute#At(0);
		}

		public void Add#attribute#(SchemaString newValue)
		{
			AppendDomChild(NodeType.Attribute, "", "#attribute#", newValue.ToString());
		}

		public void Insert#attribute#At(SchemaString newValue, int index)
		{
			InsertDomChildAt(NodeType.Attribute, "", "#attribute#", index, newValue.ToString());
		}

		public void Replace#attribute#At(SchemaString newValue, int index)
		{
			ReplaceDomChildAt(NodeType.Attribute, "", "#attribute#", index, newValue.ToString());
		}
		#endregion // #attribute# accessor methods

		#region #attribute# collection
        public #attribute#Collection	My#attribute#s = new #attribute#Collection( );

        public class #attribute#Collection: IEnumerable
        {
            #attribute# parent;
            public #attribute# Parent
			{
				set
				{
					parent = value;
				}
			}
			public #attribute#Enumerator GetEnumerator() 
			{
				return new #attribute#Enumerator(parent);
			}
		
			IEnumerator IEnumerable.GetEnumerator() 
			{
				return GetEnumerator();
			}
        }

        public class #attribute#Enumerator: IEnumerator 
        {
			int nIndex;
			#attribute# parent;
			public #attribute#Enumerator(#attribute# par) 
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
				return(nIndex < parent.#attribute#Count );
			}
			public SchemaString  Current 
			{
				get 
				{
					return(parent.Get#attribute#At(nIndex));
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
	
        #endregion // #attribute# collection

