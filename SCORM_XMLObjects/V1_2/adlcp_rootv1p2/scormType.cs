using Altova.Types;

	namespace adlcp_rootv1p2
	{

		public class scormType : SchemaString
		{
			public scormType(string newValue) : base(newValue)
			{
				Validate();
			}

			public void Validate()
			{
			}
		}
	}

